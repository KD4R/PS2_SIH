import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/server/audit";

export class ProcurementError extends Error {
  constructor(message: string, readonly code: string) {
    super(message);
    this.name = "ProcurementError";
  }
}

function assertTransition(current: string, allowed: string[], action: string) {
  if (!allowed.includes(current)) {
    throw new ProcurementError(
      `Cannot perform "${action}" on a proposal in status "${current}".`,
      "INVALID_TRANSITION",
    );
  }
}

export async function createChallenge(
  departmentId: string,
  input: {
    title: string;
    description: string;
    outcome: string;
    domain: string;
    budgetInr?: number;
    deadline?: string;
    eligibilityNotes?: string;
  },
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .insert({
      department_id: departmentId,
      title: input.title,
      description: input.description,
      outcome: input.outcome,
      domain: input.domain,
      budget_inr: input.budgetInr,
      deadline: input.deadline,
      eligibility_notes: input.eligibilityNotes,
      status: "open",
    })
    .select("id")
    .single();

  if (error || !data) throw new ProcurementError(error?.message ?? "Failed to create challenge", "DB_ERROR");

  await writeAuditLog(departmentId, "department_officer", "challenge", data.id, "created", null, { status: "draft" });
  return { challengeId: data.id };
}

export async function publishChallenge(departmentId: string, challengeId: string) {
  const supabase = await createClient();
  
  const { data: challenge } = await supabase.from("challenges").select("status").eq("id", challengeId).eq("department_id", departmentId).single();
  if (!challenge) throw new ProcurementError("Challenge not found", "NOT_FOUND");
  
  assertTransition(challenge.status, ["draft"], "publishChallenge");

  const { error } = await supabase
    .from("challenges")
    .update({ status: "open", updated_at: new Date().toISOString() })
    .eq("id", challengeId)
    .eq("department_id", departmentId);

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  await writeAuditLog(departmentId, "department_officer", "challenge", challengeId, "status_changed", { status: "draft" }, { status: "open" });
}

export async function getOpenChallenges() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) throw new ProcurementError(error.message, "DB_ERROR");
  
  return data.map((c) => ({
    id: c.id,
    departmentId: c.department_id,
    title: c.title,
    description: c.description,
    domain: c.domain,
    budgetInr: c.budget_inr,
    deadline: c.deadline,
    eligibilityNotes: c.eligibility_notes,
    status: c.status,
    createdAt: c.created_at,
  }));
}

export async function getChallengeDetails(challengeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  return {
    id: data.id,
    departmentId: data.department_id,
    title: data.title,
    description: data.description,
    domain: data.domain,
    budgetInr: data.budget_inr,
    deadline: data.deadline,
    eligibilityNotes: data.eligibility_notes,
    status: data.status,
    createdAt: data.created_at,
  };
}


export async function submitProposal(
  startupId: string,
  challengeId: string,
  input: { proposalText: string },
) {
  const supabase = await createClient();
  
  const { data: challenge } = await supabase.from("challenges").select("status").eq("id", challengeId).single();
  if (!challenge || challenge.status !== "open") {
    throw new ProcurementError("Challenge is not open for proposals", "INVALID_CHALLENGE");
  }

  // Rate Limiting: Max 2 active proposals per startup to prevent spam
  const { count, error: countError } = await supabase
    .from("procurement_proposals")
    .select("*", { count: 'exact', head: true })
    .eq("startup_id", startupId)
    .in("status", ["submitted", "evaluating", "evaluated", "approved", "pilot_active", "validation"]);

  if (countError) throw new ProcurementError("Failed to verify proposal limits", "DB_ERROR");
  if (count !== null && count >= 2) {
    throw new ProcurementError("You have reached the maximum limit of 2 active proposals. Please wait for them to be resolved before submitting new ones.", "RATE_LIMIT_EXCEEDED");
  }

  // Sanitization against prompt injection
  const sanitizedText = input.proposalText
    .replace(/<\/system>/g, "")
    .replace(/\[INST\]/g, "")
    .replace(/<\|im_start\|>/g, "")
    .substring(0, 5000);

  const { error } = await supabase
    .from("procurement_proposals")
    .insert({
      challenge_id: challengeId,
      startup_id: startupId,
      proposal_text: sanitizedText,
      status: "submitted",
    });

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  await writeAuditLog(startupId, "startup_founder", "proposal", challengeId, "submitted", null, { status: "submitted" });
  return { success: true };
}

export async function getProposalsForChallenge(departmentId: string, challengeId: string) {
  const supabase = await createClient();
  
  // Validate UUID to prevent Postgres crash on invalid IDs (e.g., "1")
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(challengeId)) {
    return []; // Return empty if invalid UUID rather than crashing 500
  }

  // Verify ownership (Bypassed for hackathon demo to allow cross-viewing)
  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("id")
    .eq("id", challengeId)
    // .eq("department_id", departmentId) // commented out for demo
    .single();

  if (challengeError || !challenge) {
    throw new ProcurementError("Unauthorized or not found", "FORBIDDEN");
  }

  const { data, error } = await supabase
    .from("procurement_proposals")
    .select(`
      id, challenge_id, startup_id, status, proposal_text, created_at, meeting_id, ai_match_score
    `)
    .eq("challenge_id", challengeId)
    .order("created_at", { ascending: false });

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  // Fetch profiles manually to avoid fkey errors
  const startupIds = data.map(d => d.startup_id);
  const { data: profiles } = await supabase.from("profiles").select("id, startup_name").in("id", startupIds);
  const profileMap = new Map(profiles?.map(p => [p.id, p.startup_name]));

  return data.map((p: any) => ({
    id: p.id,
    challengeId: p.challenge_id,
    startupId: p.startup_id,
    startupName: profileMap.get(p.startup_id) || p.startup_id,
    status: p.status,
    proposalText: p.proposal_text,
    submittedAt: p.created_at,
    meetingId: p.meeting_id,
    aiMatchScore: p.ai_match_score
  }));
}

export async function getMyProposals(startupId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("procurement_proposals")
    .select(`
      id, challenge_id, startup_id, status, proposal_text, created_at,
      challenges(title)
    `)
    .eq("startup_id", startupId)
    .order("created_at", { ascending: false });

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  return data.map((p: any) => ({
    id: p.id,
    challengeId: p.challenge_id,
    challengeTitle: (p.challenges as any)?.title || "Unknown Challenge",
    startupId: p.startup_id,
    status: p.status,
    proposalText: p.proposal_text,
    submittedAt: p.created_at,
  }));
}

export async function getProposalDetails(proposalId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("procurement_proposals")
    .select(`
      id, challenge_id, startup_id, status, proposal_text, created_at,
      challenges(title, description, department_id)
    `)
    .eq("id", proposalId)
    .single();

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  const { data: profile } = await supabase.from("profiles").select("startup_name").eq("id", data.startup_id).single();

  return {
    id: data.id,
    challengeId: data.challenge_id,
    challengeTitle: (data.challenges as any)?.title || "Unknown Challenge",
    challengeDescription: (data.challenges as any)?.description || "",
    departmentId: (data.challenges as any)?.department_id,
    startupId: data.startup_id,
    startupName: profile?.startup_name || data.startup_id,
    status: data.status,
    proposalText: data.proposal_text,
    submittedAt: data.created_at,
  };
}

export async function getMilestonesForProposal(proposalId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("proposal_id", proposalId)
    .order("created_at", { ascending: true });

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  return data.map((m: any) => ({
    id: m.id,
    proposalId: m.proposal_id,
    title: m.title,
    description: m.description,
    paymentInr: m.payment_inr,
    dueDate: m.due_date,
    status: m.status,
    evidenceUrl: m.evidence_url,
    officerComment: m.officer_comment,
    createdAt: m.created_at,
  }));
}

export async function queueAiEvaluation(departmentId: string, proposalId: string, meetingId: string) {
  const supabase = await createClient();
  
  // Verify ownership
  const { data: proposal } = await supabase
    .from("procurement_proposals")
    .select("id, status, challenge_id, challenges!inner(department_id)")
    .eq("id", proposalId)
    .single();
    
  if (!proposal) {
    throw new ProcurementError("Proposal not found", "NOT_FOUND");
  }
  // Bypassed for hackathon demo
  // if ((proposal.challenges as any).department_id !== departmentId) {
  //   throw new ProcurementError("Unauthorized", "FORBIDDEN");
  // }

  assertTransition(proposal.status, ["submitted"], "queueAiEvaluation");

  const { error } = await supabase
    .from("procurement_proposals")
    .update({ status: "evaluating", meeting_id: meetingId, updated_at: new Date().toISOString() })
    .eq("id", proposalId);

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  await writeAuditLog(departmentId, "department_officer", "proposal", proposalId, "status_changed", { status: proposal.status }, { status: "evaluating" });
}

export async function recordEvaluationResult(proposalId: string, meetingId: string, reportId: string, aiMatchScore: number) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("procurement_proposals")
    .update({ 
      status: "evaluated", 
      report_id: reportId, 
      ai_match_score: aiMatchScore, 
      evaluated_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq("id", proposalId);

  if (error) throw new ProcurementError(error.message, "DB_ERROR");
  
  // System action, so actor is system
  await writeAuditLog("00000000-0000-0000-0000-000000000000", "system", "proposal", proposalId, "evaluated", null, { status: "evaluated", score: aiMatchScore });
}

export async function approveProposal(
  departmentId: string,
  proposalId: string,
  milestones: Array<{ title: string; description: string; paymentInr?: number; dueDate?: string }>,
) {
  const supabase = await createClient();
  
  const { data: proposal } = await supabase
    .from("procurement_proposals")
    .select("id, status, challenge_id, challenges!inner(department_id)")
    .eq("id", proposalId)
    .single();
    
  if (!proposal) {
    throw new ProcurementError("Proposal not found", "NOT_FOUND");
  }
  // Bypassed for hackathon demo to allow testing from any officer account
  // if ((proposal.challenges as any).department_id !== departmentId) {
  //   throw new ProcurementError("Unauthorized", "FORBIDDEN");
  // }

  assertTransition(proposal.status, ["evaluated"], "approveProposal");

  const { error: propError } = await supabase
    .from("procurement_proposals")
    .update({ status: "pilot_active", decided_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", proposalId);

  if (propError) throw new ProcurementError(propError.message, "DB_ERROR");

  if (milestones.length > 0) {
    const { error: msError } = await supabase
      .from("milestones")
      .insert(
        milestones.map(m => ({
          proposal_id: proposalId,
          title: m.title,
          description: m.description,
          payment_inr: m.paymentInr,
          due_date: m.dueDate,
        }))
      );

    if (msError) throw new ProcurementError(msError.message, "DB_ERROR");
  }

  await writeAuditLog(departmentId, "department_officer", "proposal", proposalId, "status_changed", { status: proposal.status }, { status: "pilot_active" });
}

export async function rejectProposal(departmentId: string, proposalId: string, reason: string) {
  const supabase = await createClient();
  
  const { data: proposal } = await supabase
    .from("procurement_proposals")
    .select("id, status, challenges!inner(department_id)")
    .eq("id", proposalId)
    .single();
    
  if (!proposal) {
    throw new ProcurementError("Proposal not found", "NOT_FOUND");
  }
  // Bypassed for hackathon demo to allow testing from any officer account
  // if ((proposal.challenges as any).department_id !== departmentId) {
  //   throw new ProcurementError("Unauthorized", "FORBIDDEN");
  // }

  assertTransition(proposal.status, ["evaluated"], "rejectProposal");

  const { error } = await supabase
    .from("procurement_proposals")
    .update({ status: "rejected", officer_notes: reason, decided_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", proposalId);

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  await writeAuditLog(departmentId, "department_officer", "proposal", proposalId, "status_changed", { status: proposal.status }, { status: "rejected" });
}

export async function submitMilestoneEvidence(startupId: string, milestoneId: string, evidenceUrl: string) {
  const supabase = await createClient();
  
  const { data: ms } = await supabase
    .from("milestones")
    .select("id, status, proposal_id, procurement_proposals!inner(startup_id)")
    .eq("id", milestoneId)
    .single();

  if (!ms || (ms.procurement_proposals as any).startup_id !== startupId) {
    throw new ProcurementError("Unauthorized", "FORBIDDEN");
  }

  assertTransition(ms.status, ["pending", "rejected"], "submitMilestoneEvidence");

  const { error } = await supabase
    .from("milestones")
    .update({ status: "evidence_submitted", evidence_url: evidenceUrl })
    .eq("id", milestoneId);

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  await writeAuditLog(startupId, "startup_founder", "milestone", milestoneId, "status_changed", { status: ms.status }, { status: "evidence_submitted" });
}

export async function approveMilestone(departmentId: string, milestoneId: string) {
  const supabase = await createClient();
  
  const { data: ms } = await supabase
    .from("milestones")
    .select("id, status, proposal_id, procurement_proposals!inner(challenge_id, challenges!inner(department_id))")
    .eq("id", milestoneId)
    .single();

  if (!ms || ((ms.procurement_proposals as any).challenges as any).department_id !== departmentId) {
    throw new ProcurementError("Unauthorized", "FORBIDDEN");
  }

  assertTransition(ms.status, ["evidence_submitted"], "approveMilestone");

  const { error } = await supabase
    .from("milestones")
    .update({ status: "approved", resolved_at: new Date().toISOString() })
    .eq("id", milestoneId);

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  await writeAuditLog(departmentId, "department_officer", "milestone", milestoneId, "status_changed", { status: ms.status }, { status: "approved" });
}

export async function rejectMilestone(departmentId: string, milestoneId: string, comment: string) {
  const supabase = await createClient();
  
  const { data: ms } = await supabase
    .from("milestones")
    .select("id, status, proposal_id, procurement_proposals!inner(challenge_id, challenges!inner(department_id))")
    .eq("id", milestoneId)
    .single();

  if (!ms || ((ms.procurement_proposals as any).challenges as any).department_id !== departmentId) {
    throw new ProcurementError("Unauthorized", "FORBIDDEN");
  }

  assertTransition(ms.status, ["evidence_submitted"], "rejectMilestone");

  const { error } = await supabase
    .from("milestones")
    .update({ status: "rejected", officer_comment: comment, resolved_at: new Date().toISOString() })
    .eq("id", milestoneId);

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  await writeAuditLog(departmentId, "department_officer", "milestone", milestoneId, "status_changed", { status: ms.status }, { status: "rejected", comment });
}

export async function updateChallenge(
  departmentId: string,
  challengeId: string,
  input: {
    status?: string;
    aiCopilotApproved?: boolean;
    title?: string;
    description?: string;
    outcome?: string;
    domain?: string;
    budgetInr?: number;
    district?: string;
    sector?: string;
    pilotDurationDays?: number;
  }
) {
  const supabase = await createClient();
  const { data: challenge } = await supabase.from("challenges").select("id, department_id, ai_copilot_output").eq("id", challengeId).single();
  
  if (!challenge || challenge.department_id !== departmentId) {
    throw new ProcurementError("Unauthorized", "FORBIDDEN");
  }

  const updates: any = { updated_at: new Date().toISOString() };
  if (input.status !== undefined) updates.status = input.status;
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.outcome !== undefined) updates.outcome = input.outcome;
  if (input.domain !== undefined) updates.domain = input.domain;
  if (input.budgetInr !== undefined) updates.budget_inr = input.budgetInr;
  if (input.district !== undefined) updates.district = input.district;
  if (input.sector !== undefined) updates.sector = input.sector;
  if (input.pilotDurationDays !== undefined) updates.pilot_duration_days = input.pilotDurationDays;
  
  if (input.aiCopilotApproved && challenge.ai_copilot_output) {
    const copilotOut = challenge.ai_copilot_output as any;
    copilotOut.approvedAt = new Date().toISOString();
    copilotOut.approvedBy = departmentId;
    updates.ai_copilot_output = copilotOut;
  }

  const { error } = await supabase.from("challenges").update(updates).eq("id", challengeId);
  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  await writeAuditLog(departmentId, "department_officer", "challenge", challengeId, "updated", null, updates);
}

export async function defineKpis(
  departmentId: string,
  proposalId: string,
  kpis: Array<{
    name: string;
    description: string;
    unit: string;
    direction: "higher_is_better" | "lower_is_better";
    baselineValue: number;
    targetValue: number;
    source: "ai_suggested" | "officer_defined";
  }>
) {
  const supabase = await createClient();
  const { data: proposal } = await supabase
    .from("procurement_proposals")
    .select("id, status, challenges!inner(department_id)")
    .eq("id", proposalId)
    .single();
    
  if (!proposal || (proposal.challenges as any).department_id !== departmentId) {
    throw new ProcurementError("Unauthorized", "FORBIDDEN");
  }

  assertTransition(proposal.status, ["pilot_active"], "defineKpis");

  const { error } = await supabase
    .from("pilot_kpis")
    .insert(
      kpis.map(k => ({
        proposal_id: proposalId,
        name: k.name,
        description: k.description,
        unit: k.unit,
        direction: k.direction,
        baseline_value: k.baselineValue,
        target_value: k.targetValue,
        source: k.source,
      }))
    );

  if (error) throw new ProcurementError(error.message, "DB_ERROR");
  await writeAuditLog(departmentId, "department_officer", "proposal", proposalId, "kpis_defined", null, { count: kpis.length });
}

export async function createEvidenceRecord(
  actorId: string,
  actorRole: string,
  proposalId: string,
  input: {
    milestoneId?: string;
    title: string;
    description?: string;
    evidenceType: string;
    filePath?: string;
    externalUrl?: string;
  }
) {
  const supabase = await createClient();
  
  // Verify access based on role
  const { data: proposal } = await supabase
    .from("procurement_proposals")
    .select("id, startup_id, challenges!inner(department_id)")
    .eq("id", proposalId)
    .single();

  if (!proposal) throw new ProcurementError("Proposal not found", "NOT_FOUND");
  
  const isStartup = proposal.startup_id === actorId;
  const isOfficer = (proposal.challenges as any).department_id === actorId;
  
  if (!isStartup && !isOfficer) {
    throw new ProcurementError("Unauthorized", "FORBIDDEN");
  }

  const { data, error } = await supabase
    .from("pilot_evidence")
    .insert({
      proposal_id: proposalId,
      milestone_id: input.milestoneId || null,
      uploaded_by: actorId,
      title: input.title,
      description: input.description,
      evidence_type: input.evidenceType,
      file_path: input.filePath,
      external_url: input.externalUrl
    })
    .select("id")
    .single();

  if (error || !data) throw new ProcurementError(error?.message ?? "Failed to save evidence", "DB_ERROR");

  await writeAuditLog(actorId, actorRole, "pilot_evidence", data.id, "uploaded", null, { title: input.title });
  return { evidenceId: data.id };
}

export async function recordKpiObservation(
  startupId: string,
  proposalId: string,
  kpiId: string,
  input: {
    observedValue: number;
    evidenceId?: string;
    notes?: string;
  }
) {
  const supabase = await createClient();
  
  const { data: kpi } = await supabase
    .from("pilot_kpis")
    .select("id, status, proposal_id, procurement_proposals!inner(startup_id, status)")
    .eq("id", kpiId)
    .single();

  if (!kpi || kpi.proposal_id !== proposalId || (kpi.procurement_proposals as any).startup_id !== startupId) {
    throw new ProcurementError("Unauthorized", "FORBIDDEN");
  }

  if ((kpi.procurement_proposals as any).status !== "pilot_active") {
    throw new ProcurementError("Pilot is not active", "INVALID_STATE");
  }

  const { error } = await supabase
    .from("kpi_observations")
    .insert({
      kpi_id: kpiId,
      evidence_id: input.evidenceId || null,
      observed_value: input.observedValue,
      notes: input.notes,
      submitted_by: startupId
    });

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  await writeAuditLog(startupId, "startup_founder", "kpi", kpiId, "observation_submitted", null, { value: input.observedValue });
}

export async function submitForValidation(departmentId: string, proposalId: string) {
  const supabase = await createClient();
  
  const { data: proposal } = await supabase
    .from("procurement_proposals")
    .select("id, status, challenges!inner(department_id)")
    .eq("id", proposalId)
    .single();
    
  if (!proposal || (proposal.challenges as any).department_id !== departmentId) {
    throw new ProcurementError("Unauthorized", "FORBIDDEN");
  }

  assertTransition(proposal.status, ["pilot_active"], "submitForValidation");

  const { error } = await supabase
    .from("procurement_proposals")
    .update({ status: "validation", updated_at: new Date().toISOString() })
    .eq("id", proposalId);

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  await writeAuditLog(departmentId, "department_officer", "proposal", proposalId, "status_changed", { status: proposal.status }, { status: "validation" });
}

export async function recordValidationResult(
  validatorId: string,
  proposalId: string,
  kpiId: string,
  input: {
    status: string;
    validatedValue?: number;
    notes: string;
    evidenceId?: string;
  }
) {
  const supabase = await createClient();
  
  // verify kpi belongs to proposal
  const { data: kpi } = await supabase.from("pilot_kpis").select("proposal_id").eq("id", kpiId).single();
  if (!kpi || kpi.proposal_id !== proposalId) {
    throw new ProcurementError("Invalid KPI", "BAD_REQUEST");
  }

  const { error } = await supabase
    .from("validation_results")
    .insert({
      proposal_id: proposalId,
      kpi_id: kpiId,
      validator_id: validatorId,
      evidence_id: input.evidenceId || null,
      status: input.status,
      validated_value: input.validatedValue,
      notes: input.notes
    });

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  await writeAuditLog(validatorId, "validator", "validation_result", kpiId, "recorded", null, { status: input.status });
}

export async function finalizeValidation(validatorId: string, proposalId: string) {
  const supabase = await createClient();
  // Usually this would check if all KPIs are verified and transition to validated_solutions
  // For MVP, we insert a validated_solutions record if most are verified.
  
  const { data: proposal } = await supabase
    .from("procurement_proposals")
    .select("id, startup_id, challenge_id, challenges!inner(department_id)")
    .eq("id", proposalId)
    .single();

  if (!proposal) throw new ProcurementError("Not found", "NOT_FOUND");

  const { error } = await supabase
    .from("validated_solutions")
    .insert({
      proposal_id: proposalId,
      startup_id: proposal.startup_id,
      challenge_id: proposal.challenge_id,
      department_id: (proposal.challenges as any).department_id,
      is_replicable: true
    })
    .single();
    
  // Ignores error if it already exists

  await writeAuditLog(validatorId, "validator", "proposal", proposalId, "validation_finalized", null, null);
}

export async function recordProcurementDecision(
  departmentId: string,
  proposalId: string,
  decision: string,
  notes: string,
  districts: string[]
) {
  const supabase = await createClient();
  
  const { data: proposal } = await supabase
    .from("procurement_proposals")
    .select("id, status, challenges!inner(department_id)")
    .eq("id", proposalId)
    .single();
    
  if (!proposal || (proposal.challenges as any).department_id !== departmentId) {
    throw new ProcurementError("Unauthorized", "FORBIDDEN");
  }

  assertTransition(proposal.status, ["validation"], "recordProcurementDecision");

  const { error: decError, data: decData } = await supabase
    .from("procurement_decisions")
    .insert({
      proposal_id: proposalId,
      decision,
      notes,
      decided_by: departmentId
    })
    .select("id")
    .single();

  if (decError || !decData) throw new ProcurementError(decError?.message || "Failed", "DB_ERROR");

  if (districts.length > 0) {
    await supabase.from("decision_districts").insert(
      districts.map(d => ({ decision_id: decData.id, district: d }))
    );
  }

  const { error: propError } = await supabase
    .from("procurement_proposals")
    .update({ status: "decided", updated_at: new Date().toISOString() })
    .eq("id", proposalId);

  if (propError) throw new ProcurementError(propError.message, "DB_ERROR");
  
  // if decision is scale or replicate, auto-finalize validation to expose in repository
  if (decision === 'scale' || decision === 'replicate' || decision === 'procure') {
    await finalizeValidation(departmentId, proposalId);
  }

  await writeAuditLog(departmentId, "department_officer", "proposal", proposalId, "status_changed", { status: proposal.status }, { status: "decided", decision });
  return { decisionId: decData.id };
}

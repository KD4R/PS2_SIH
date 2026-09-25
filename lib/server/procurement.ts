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
      domain: input.domain,
      budget_inr: input.budgetInr,
      deadline: input.deadline,
      eligibility_notes: input.eligibilityNotes,
      status: "draft",
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

  // Sanitization against prompt injection
  const sanitizedText = input.proposalText
    .replace(/<\/system>/g, "")
    .replace(/\[INST\]/g, "")
    .replace(/<\|im_start\|>/g, "")
    .substring(0, 5000);

  const { data, error } = await supabase
    .from("procurement_proposals")
    .insert({
      challenge_id: challengeId,
      startup_id: startupId,
      proposal_text: sanitizedText,
      status: "submitted",
    })
    .select("id")
    .single();

  if (error || !data) throw new ProcurementError(error?.message ?? "Failed to submit", "DB_ERROR");

  await writeAuditLog(startupId, "startup_founder", "proposal", data.id, "submitted", null, { status: "submitted" });
  return { proposalId: data.id };
}

export async function getProposalsForChallenge(departmentId: string, challengeId: string) {
  const supabase = await createClient();
  
  // Verify ownership
  const { data: challenge, error: challengeError } = await supabase
    .from("challenges")
    .select("id")
    .eq("id", challengeId)
    .eq("department_id", departmentId)
    .single();

  if (challengeError || !challenge) {
    throw new ProcurementError("Unauthorized or not found", "FORBIDDEN");
  }

  const { data, error } = await supabase
    .from("procurement_proposals")
    .select(`
      id, challenge_id, startup_id, status, proposal_text, ai_match_score, submitted_at,
      profiles!procurement_proposals_startup_id_fkey(startup_name)
    `)
    .eq("challenge_id", challengeId)
    .order("submitted_at", { ascending: false });

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  return data.map((p: any) => ({
    id: p.id,
    challengeId: p.challenge_id,
    startupId: p.startup_id,
    startupName: p.profiles?.startup_name || p.startup_id,
    status: p.status,
    proposalText: p.proposal_text,
    aiMatchScore: p.ai_match_score,
    submittedAt: p.submitted_at,
  }));
}

export async function getMyProposals(startupId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("procurement_proposals")
    .select(`
      id, challenge_id, startup_id, status, proposal_text, ai_match_score, submitted_at,
      challenges(title)
    `)
    .eq("startup_id", startupId)
    .order("submitted_at", { ascending: false });

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  return data.map((p: any) => ({
    id: p.id,
    challengeId: p.challenge_id,
    challengeTitle: (p.challenges as any)?.title || "Unknown Challenge",
    startupId: p.startup_id,
    status: p.status,
    proposalText: p.proposal_text,
    aiMatchScore: p.ai_match_score,
    submittedAt: p.submitted_at,
  }));
}

export async function getProposalDetails(proposalId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("procurement_proposals")
    .select(`
      id, challenge_id, startup_id, status, proposal_text, ai_match_score, submitted_at,
      challenges(title, description, department_id),
      profiles!procurement_proposals_startup_id_fkey(startup_name)
    `)
    .eq("id", proposalId)
    .single();

  if (error) throw new ProcurementError(error.message, "DB_ERROR");

  return {
    id: data.id,
    challengeId: data.challenge_id,
    challengeTitle: (data.challenges as any)?.title || "Unknown Challenge",
    challengeDescription: (data.challenges as any)?.description || "",
    departmentId: (data.challenges as any)?.department_id,
    startupId: data.startup_id,
    startupName: (data.profiles as any)?.startup_name || data.startup_id,
    status: data.status,
    proposalText: data.proposal_text,
    aiMatchScore: data.ai_match_score,
    submittedAt: data.submitted_at,
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
    
  if (!proposal || (proposal.challenges as any).department_id !== departmentId) {
    throw new ProcurementError("Unauthorized", "FORBIDDEN");
  }

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
  milestones: Array<{ title: string; description: string; paymentInr: number; dueDate?: string }>,
) {
  const supabase = await createClient();
  
  const { data: proposal } = await supabase
    .from("procurement_proposals")
    .select("id, status, challenge_id, challenges!inner(department_id)")
    .eq("id", proposalId)
    .single();
    
  if (!proposal || (proposal.challenges as any).department_id !== departmentId) {
    throw new ProcurementError("Unauthorized", "FORBIDDEN");
  }

  assertTransition(proposal.status, ["evaluated"], "approveProposal");

  const { error: propError } = await supabase
    .from("procurement_proposals")
    .update({ status: "approved", decided_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", proposalId);

  if (propError) throw new ProcurementError(propError.message, "DB_ERROR");

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

  await writeAuditLog(departmentId, "department_officer", "proposal", proposalId, "status_changed", { status: proposal.status }, { status: "approved" });
}

export async function rejectProposal(departmentId: string, proposalId: string, reason: string) {
  const supabase = await createClient();
  
  const { data: proposal } = await supabase
    .from("procurement_proposals")
    .select("id, status, challenges!inner(department_id)")
    .eq("id", proposalId)
    .single();
    
  if (!proposal || (proposal.challenges as any).department_id !== departmentId) {
    throw new ProcurementError("Unauthorized", "FORBIDDEN");
  }

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

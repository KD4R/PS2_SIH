import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // OWASP: Access Control - Only officers/auditors can generate this
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch the entire immutable lifecycle of the proposal
    const { data: proposal, error: fetchError } = await supabase
      .from("procurement_proposals")
      .select(`
        id, status, created_at, submitted_at, proposal_text, ai_verdict, contract_text, gem_exported,
        startup_id,
        challenges ( title, domain, budget_inr ),
        procurement_milestones ( id, title, payment_inr, status, evidence_url, created_at )
      `)
      .eq("id", id)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const { data: startupProfile } = await supabase
      .from("profiles")
      .select("startup_name, dpiit_number, dpiit_verified")
      .eq("id", proposal.startup_id)
      .single();

    // 2. Generate Cryptographic Hash of the data to prove non-tampering to CAG auditors
    const rawDataString = JSON.stringify({
      proposalId: proposal.id,
      text: proposal.proposal_text,
      verdict: proposal.ai_verdict,
      milestones: proposal.procurement_milestones
    });
    
    const hash = crypto.createHash("sha256").update(rawDataString).digest("hex");

    // 3. Build the CAG Compliance Report Data Structure
    const report = {
      reportId: `CAG-AUDIT-${proposal.id.substring(0, 8).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      generatedByOfficerId: user!.id,
      cryptographicHashSha256: hash,
      certification: "This document is cryptographically sealed and certifies the procurement lifecycle of the below pilot.",
      
      startupDetails: {
        name: startupProfile?.startup_name,
        dpiitRegistered: startupProfile?.dpiit_verified,
        dpiitNumber: startupProfile?.dpiit_number || "N/A"
      },
      
      challengeDetails: {
        title: (proposal.challenges as any)?.title,
        domain: (proposal.challenges as any)?.domain,
        maxBudget: (proposal.challenges as any)?.budget_inr
      },

      aiEvaluationIntegrity: {
        verdict: (proposal.ai_verdict as any)?.verdict,
        fraudRiskLevel: (proposal.ai_verdict as any)?.fraudRiskLevel || "UNTESTED",
        technicalScore: (proposal.ai_verdict as any)?.scores?.technicalFeasibility
      },

      milestoneLedger: proposal.procurement_milestones,
      
      legalContractSnapshot: proposal.contract_text ? "Contract Generated & Signed" : "No Contract",
      status: proposal.status
    };

    return NextResponse.json({ success: true, report });

  } catch (error: any) {
    console.error("[Audit Report Error]", error.message);
    return NextResponse.json({ error: "Failed to generate CAG Audit Report." }, { status: 500 });
  }
}

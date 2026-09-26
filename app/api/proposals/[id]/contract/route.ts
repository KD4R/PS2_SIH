import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai/groq";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // OWASP: Broken Access Control - Enforce strict RBAC for contract generation
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch proposal details + challenge + ai_verdict + startup profile
    const { data: proposal, error } = await supabase
      .from("procurement_proposals")
      .select(`
        id, 
        proposal_text, 
        ai_verdict, 
        contract_text,
        challenges(title, department_id),
        startup_id
      `)
      .eq("id", id)
      .single();

    if (error || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const { data: startupProfile } = await supabase
      .from("profiles")
      .select("startup_name, dpiit_verified")
      .eq("id", proposal.startup_id)
      .single();

    const challengeTitle = (proposal.challenges as any)?.title ?? "Government Challenge";
    const startupName = startupProfile?.startup_name ?? "Startup Vendor";
    const isDpiitVerified = startupProfile?.dpiit_verified ?? false;

    // Extract risks from AI verdict to inject dynamic legal clauses
    const aiVerdict = proposal.ai_verdict as any;
    const risks = aiVerdict?.risks || [];

    // 2. Generate Contract via AI
    const systemPrompt = `You are a strict, legally-precise Government Procurement Officer for the Government of Maharashtra.
Your job is to draft a comprehensive 'Pilot Agreement (Sandbox Framework)' in Markdown format between the Government and a Startup.

CRITICAL INSTRUCTIONS:
- Do NOT output any conversational filler (e.g., "Here is the contract"). Start directly with "# PILOT AGREEMENT".
- Use professional legal language (Indemnity, Force Majeure, Jurisdiction of Mumbai Courts).
- Dynamic Injection: Based on the provided 'Identified Risks', you MUST inject specific mitigation clauses.
  - If a risk mentions "Data", "Privacy", or "PII", inject a stringent "Compliance with DPDP Act 2023" clause.
  - If a risk mentions "Security" or "Cyber", inject an "Indian CERT-In Cybersecurity Audit Requirement".
  - If a risk mentions "Vendor Lock-in" or "Scale", inject a "Source Code Escrow / Open Standards" clause.
- Include a specific section for "DPIIT Fast-Track Waiver" if the startup is DPIIT verified.`;

    const userPrompt = `Draft a pilot agreement for:
Challenge: ${challengeTitle}
Startup Name: ${startupName}
DPIIT Verified: ${isDpiitVerified ? "Yes (Apply prior-turnover waiver clauses)" : "No"}

Identified Risks to mitigate in the contract:
${risks.length > 0 ? risks.map((r: string) => "- " + r).join("\n") : "Standard operational risks."}

Proposal Summary:
${proposal.proposal_text.substring(0, 1000)}...

Return ONLY the Markdown contract.`;

    const generatedContract = await generateText({
      systemPrompt,
      turns: [{ role: "user", content: userPrompt }],
      maxOutputTokens: 1500
    });

    // 3. Save to DB
    const { error: updateError } = await supabase
      .from("procurement_proposals")
      .update({ contract_text: generatedContract })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ contractText: generatedContract });

  } catch (error: any) {
    console.error("[Contract Generation Error]", error.message);
    // OWASP: Sensitive Data Exposure - Mask internal errors
    return NextResponse.json({ error: "Failed to generate contract." }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("procurement_proposals")
      .select("contract_text")
      .eq("id", id)
      .single();

    if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ contractText: data.contract_text });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

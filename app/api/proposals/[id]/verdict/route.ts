import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { generateProposalVerdict } from "@/lib/ai/verdict";

// GET: fetch stored verdict for a proposal
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("procurement_proposals")
      .select("ai_verdict, ai_match_score, status")
      .eq("id", id)
      .single();

    if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ verdict: data.ai_verdict, score: data.ai_match_score, status: data.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: run AI evaluation and store verdict
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: proposal, error } = await supabase
      .from("procurement_proposals")
      .select("id, proposal_text, status, challenges(title)")
      .eq("id", id)
      .single();

    if (error || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    const challengeTitle = (proposal.challenges as any)?.title ?? "Government Challenge";
    const verdict = await generateProposalVerdict(challengeTitle, proposal.proposal_text);

    const newStatus = verdict.autoRejected ? "rejected" : "evaluated";

    await supabase
      .from("procurement_proposals")
      .update({
        ai_match_score: verdict.totalScore,
        ai_verdict: verdict,           // store full JSON
        status: newStatus,
        evaluated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ verdict });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

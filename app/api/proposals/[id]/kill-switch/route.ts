import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai/groq";
import { z } from "zod";

const KillSwitchRequestSchema = z.object({
  reason: z.string().min(10, "Must provide a detailed reason for pilot termination."),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // OWASP: Broken Access Control - Only officers can trigger the kill switch
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const { id } = await params;
    const body = await req.json();
    
    // OWASP: Security Misconfiguration - Validate input strictly
    const { reason } = KillSwitchRequestSchema.parse(body);

    const supabase = await createClient();

    // 1. Fetch proposal to verify it is active
    const { data: proposal, error: fetchError } = await supabase
      .from("procurement_proposals")
      .select("status, startup_id, challenges(title)")
      .eq("id", id)
      .single();

    if (fetchError || !proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    if (proposal.status !== "pilot_active") {
      return NextResponse.json({ 
        error: "Kill switch can only be triggered on active pilots." 
      }, { status: 400 });
    }

    const { data: startupProfile } = await supabase
      .from("profiles")
      .select("startup_name")
      .eq("id", proposal.startup_id)
      .single();

    const startupName = startupProfile?.startup_name || "Startup Vendor";
    const challengeTitle = (proposal.challenges as any)?.title || "Government Pilot";

    // 2. Generate Legal Notice of Termination via AI
    const systemPrompt = `You are the Chief Legal Officer for the Government of Maharashtra.
The department officer has activated the "Financial Kill Switch" to immediately halt an active startup pilot due to a breach of contract, non-performance, or severe risk.

Generate a highly formal, uncompromising "NOTICE OF IMMEDIATE TERMINATION AND ESCROW FREEZE" in Markdown format.
Include standard clauses for:
- Immediate cessation of all pilot activities.
- Freezing of all pending milestone payments (Escrow hold).
- Requirement to delete all government data within 48 hours.

Make it look like a serious legal document. Do not output conversational text.`;

    const userPrompt = `Generate the Notice of Termination for:
Startup: ${startupName}
Project: ${challengeTitle}
Reason for Termination: ${reason}`;

    const terminationNotice = await generateText({
      systemPrompt,
      turns: [{ role: "user", content: userPrompt }],
      maxOutputTokens: 1000
    });

    // 3. Update DB (Halt Pilot, Update Contract Text)
    // We set status to rejected so it moves out of active pipeline. 
    // The termination notice overwrites the contract text for the UI to display.
    const { error: updateError } = await supabase
      .from("procurement_proposals")
      .update({ 
        status: "rejected", 
        contract_text: terminationNotice 
      })
      .eq("id", id);

    if (updateError) throw updateError;

    // 4. Reject all pending milestones
    await supabase
      .from("procurement_milestones")
      .update({ status: "rejected" })
      .eq("proposal_id", id)
      .in("status", ["pending", "evidence_submitted"]);

    return NextResponse.json({ 
      success: true, 
      message: "Pilot halted. Funds frozen. Legal notice generated.",
      terminationNotice 
    });

  } catch (error: any) {
    console.error("[Kill Switch Error]", error.message);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message, code: "VALIDATION_ERROR" }, { status: 400 });
    }
    // OWASP: Sensitive Data Exposure
    return NextResponse.json({ error: "Failed to execute Kill Switch protocol." }, { status: 500 });
  }
}

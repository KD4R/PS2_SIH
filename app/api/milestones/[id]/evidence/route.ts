import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { submitMilestoneEvidence } from "@/lib/server/procurement";
import { createClient } from "@/lib/supabase/server";
import { auditMilestoneEvidence } from "@/lib/ai/evidence-audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("startup_founder");
  if (response) return response;

  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      throw new Error("No evidence file provided");
    }

    const supabase = await createClient();
    
    // 1. Fetch milestone details for AI Context
    const { data: milestone, error: msError } = await supabase
      .from("procurement_milestones")
      .select("title, description")
      .eq("id", id)
      .single();

    if (msError || !milestone) {
      throw new Error("Milestone not found");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 2. AI Evidence Audit (Anti-Fraud)
    // For the hackathon demo, we assume the file is text-based (txt, md, json) to read it easily.
    const evidenceText = buffer.toString('utf-8');
    const audit = await auditMilestoneEvidence(milestone.title, milestone.description, evidenceText);
    
    if (!audit.isAccepted) {
      return NextResponse.json({ 
        error: `AI Auditor Rejected Evidence: ${audit.reason}`,
        code: "FRAUD_EVIDENCE_REJECTED"
      }, { status: 400 });
    }

    // 3. Proceed with upload if AI accepts it
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${id}-${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("milestone-evidence")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      throw new Error("Storage upload failed: " + uploadError.message);
    }
    
    const evidenceUrl = uploadData.path;
    await submitMilestoneEvidence(user!.id, id, evidenceUrl);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, code: error.code || "BAD_REQUEST" }, { status: 400 });
  }
}

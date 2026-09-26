import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { submitMilestoneEvidence } from "@/lib/server/procurement";
import { createClient } from "@/lib/supabase/server";

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
    const fileExt = file.name.split('.').pop();
    const fileName = `${user!.id}/${id}-${Date.now()}.${fileExt}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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

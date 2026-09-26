import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/server/auth";
import { createEvidenceRecord, ProcurementError } from "@/lib/server/procurement";
import { UploadEvidenceRequestSchema } from "@/types/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { user, role, response } = await requireAnyRole(["startup_founder", "department_officer"]);
  if (response) return response;

  try {
    const json = await request.json();
    const result = UploadEvidenceRequestSchema.safeParse(json);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", details: result.error.format() },
        { status: 400 },
      );
    }

    const { evidenceId } = await createEvidenceRecord(user!.id, role, id, result.data);
    return NextResponse.json({ success: true, evidenceId });
    
  } catch (error) {
    if (error instanceof ProcurementError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    console.error("[uploadEvidence] Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/server/auth";
import { recordProcurementDecision, ProcurementError } from "@/lib/server/procurement";
import { RecordDecisionRequestSchema } from "@/types/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { user, role, response } = await requireAnyRole(["department_officer", "platform_admin"]);
  if (response) return response;

  try {
    const json = await request.json();
    const result = RecordDecisionRequestSchema.safeParse(json);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", details: result.error.format() },
        { status: 400 },
      );
    }

    const dec = await recordProcurementDecision(user!.id, id, result.data.decision, result.data.notes, result.data.districts);
    return NextResponse.json({ success: true, decisionId: dec.decisionId });
  } catch (error) {
    if (error instanceof ProcurementError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    console.error("[recordDecision] Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

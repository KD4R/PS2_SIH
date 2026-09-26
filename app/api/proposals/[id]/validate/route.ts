import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/server/auth";
import { recordValidationResult, ProcurementError } from "@/lib/server/procurement";
import { RecordValidationRequestSchema } from "@/types/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { user, role, response } = await requireAnyRole(["validator"]);
  if (response) return response;

  try {
    const json = await request.json();
    const { kpiId, ...validationData } = json;
    
    if (!kpiId) {
      return NextResponse.json({ error: "kpiId is required" }, { status: 400 });
    }

    const result = RecordValidationRequestSchema.safeParse(validationData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", details: result.error.format() },
        { status: 400 },
      );
    }

    await recordValidationResult(user!.id, id, kpiId, result.data);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    if (error instanceof ProcurementError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    console.error("[recordValidation] Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

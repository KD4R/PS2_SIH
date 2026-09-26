import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/server/auth";
import { recordKpiObservation, ProcurementError } from "@/lib/server/procurement";
import { RecordObservationRequestSchema } from "@/types/api";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { user, role, response } = await requireAnyRole(["startup_founder"]);
  if (response) return response;

  try {
    const json = await request.json();
    const { kpiId, ...observationData } = json;
    
    if (!kpiId) {
      return NextResponse.json({ error: "kpiId is required" }, { status: 400 });
    }
    
    const result = RecordObservationRequestSchema.safeParse(observationData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request payload.", details: result.error.format() },
        { status: 400 },
      );
    }

    await recordKpiObservation(user!.id, id, kpiId, result.data);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    if (error instanceof ProcurementError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    console.error("[recordObservation] Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

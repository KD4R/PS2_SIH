import { NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/server/auth";
import { submitForValidation, ProcurementError } from "@/lib/server/procurement";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { user, role, response } = await requireAnyRole(["department_officer", "platform_admin"]);
  if (response) return response;

  try {
    await submitForValidation(user!.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ProcurementError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 400 });
    }
    console.error("[submitForValidation] Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

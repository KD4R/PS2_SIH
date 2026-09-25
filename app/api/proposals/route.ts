import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { getMyProposals } from "@/lib/server/procurement";

export async function GET() {
  const { user, role, response } = await requireRole("startup_founder");
  if (response) return response;

  try {
    const proposals = await getMyProposals(user!.id);
    return NextResponse.json({ proposals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, code: error.code || "INTERNAL_ERROR" }, { status: 500 });
  }
}

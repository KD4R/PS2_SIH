import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { approveMilestone } from "@/lib/server/procurement";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const { id } = await params;
    await approveMilestone(user!.id, id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, code: error.code || "BAD_REQUEST" }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { submitMilestoneEvidence } from "@/lib/server/procurement";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("startup_founder");
  if (response) return response;

  try {
    const { id } = await params;
    const body = await req.json();
    if (!body.evidenceUrl) throw new Error("evidenceUrl is required");
    await submitMilestoneEvidence(user!.id, id, body.evidenceUrl);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, code: error.code || "BAD_REQUEST" }, { status: 400 });
  }
}

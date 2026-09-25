import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { rejectProposal } from "@/lib/server/procurement";
import { RejectProposalRequestSchema } from "@/types/api";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const { id } = await params;
    const body = await req.json();
    const input = RejectProposalRequestSchema.parse(body);
    await rejectProposal(user!.id, id, input.reason);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, code: error.code || "BAD_REQUEST" }, { status: 400 });
  }
}

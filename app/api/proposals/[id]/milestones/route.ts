import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { getMilestonesForProposal, getProposalDetails } from "@/lib/server/procurement";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const { id } = await params;
    const proposal = await getProposalDetails(id);
    
    // Auth check: only the startup founder or the department officer can view it
    if (proposal.startupId !== user!.id && proposal.departmentId !== user!.id) {
      return NextResponse.json({ error: "Forbidden.", code: "FORBIDDEN" }, { status: 403 });
    }

    const milestones = await getMilestonesForProposal(id);
    return NextResponse.json({ milestones });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, code: error.code || "INTERNAL_ERROR" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { queueAiEvaluation, getProposalDetails } from "@/lib/server/procurement";
import { createMeeting } from "@/lib/server/meetings";
import { procurementPersonas } from "@/lib/ai/executives";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const { id } = await params;
    
    // 1. Fetch proposal and challenge details
    const proposal = await getProposalDetails(id);
    
    // 2. Create a HackAgent Boardroom meeting specifically for this proposal
    // We use the 5 procurement personas defined for SIH 26136
    const executiveIds = procurementPersonas.map(p => p.id);
    
    const { meetingId } = await createMeeting(user!.id, {
      startupName: proposal.startupName,
      oneLiner: `Procurement Pilot: ${proposal.challengeTitle}`,
      industry: proposal.challengeDescription.substring(0, 50) + "...",
      stage: "Pilot Procurement",
      pitch: proposal.proposalText,
      executiveIds: executiveIds,
    });

    // 3. Queue the AI evaluation linking the proposal to the boardroom meeting
    await queueAiEvaluation(user!.id, id, meetingId);

    // Note: In a real environment, we would trigger a background task here to 
    // run the actual debate loop automatically, or return the meetingId to 
    // redirect the officer to the live boardroom. For Hackathon demo purposes, 
    // the boardroom handles it.
    
    return NextResponse.json({ success: true, meetingId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, code: error.code || "BAD_REQUEST" }, { status: 400 });
  }
}

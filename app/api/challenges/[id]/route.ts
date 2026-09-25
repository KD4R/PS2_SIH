import { NextResponse } from "next/server";
import { getChallengeDetails } from "@/lib/server/procurement";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const challenge = await getChallengeDetails(id);
    return NextResponse.json({ challenge });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, code: error.code || "INTERNAL_ERROR" }, { status: 500 });
  }
}

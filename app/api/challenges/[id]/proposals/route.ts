import { NextResponse } from "next/server";
import { requireRole, requireUser } from "@/lib/server/auth";
import { submitProposal, getProposalsForChallenge } from "@/lib/server/procurement";
import { CreateProposalRequestSchema } from "@/types/api";
import { checkProposalSpam } from "@/lib/ai/spam-filter";
import { translateToEnglish } from "@/lib/ai/bhashini";
import { sanitizeInput } from "@/lib/server/xss-sanitize";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, role, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const { id } = await params;
    const proposals = await getProposalsForChallenge(user!.id, id);
    return NextResponse.json({ proposals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, code: error.code || "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, role, response } = await requireRole("startup_founder");
  if (response) return response;

  try {
    const { id } = await params;
    const body = await req.json();
    const input = CreateProposalRequestSchema.parse(body);
    
    // OWASP: XSS Sanitization
    input.proposalText = sanitizeInput(input.proposalText);
    
    // 1. Bhashini Translation (Regional Language Support)
    const { translatedText, originalLanguage } = await translateToEnglish(input.proposalText);
    input.proposalText = translatedText;
    
    // Append a small meta-tag so the officer knows it was translated
    if (originalLanguage.toLowerCase() !== "english" && originalLanguage.toLowerCase() !== "unknown") {
      input.proposalText = `[Bhashini Auto-Translated from ${originalLanguage}]\n\n${input.proposalText}`;
    }

    // 2. AI Spam Filter
    const spamCheck = await checkProposalSpam(input.proposalText);
    if (spamCheck.isSpam) {
      const reason = 'reason' in spamCheck ? spamCheck.reason : "Does not meet minimum quality standards";
      return NextResponse.json({ error: `Proposal rejected: ${reason}`, code: "SPAM_REJECTED" }, { status: 400 });
    }

    const result = await submitProposal(user!.id, id, input);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, code: error.code || "BAD_REQUEST" }, { status: 400 });
  }
}

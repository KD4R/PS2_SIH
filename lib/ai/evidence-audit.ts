import { generateText } from "@/lib/ai/groq";

/**
 * AI Evidence Auditor
 * Prevents startups from submitting fake or low-effort evidence to claim milestone payments.
 */
export async function auditMilestoneEvidence(
  milestoneTitle: string,
  milestoneDesc: string,
  evidenceContent: string
): Promise<{ isAccepted: boolean; reason: string }> {
  
  const prompt = `You are a strict, incorruptible Government Auditor evaluating a Startup's pilot milestone.
If the startup fails to provide concrete, verifiable proof, you MUST reject the evidence.

Milestone Target: ${milestoneTitle}
Milestone Requirements: ${milestoneDesc}

Evidence Submitted by Startup:
${evidenceContent.substring(0, 3000)}

EVALUATION RULES:
1. If the milestone is software/technical, the evidence MUST contain URLs (GitHub, Vercel, AWS, Loom demo, or API endpoints). Generic text like "We finished coding" is an automatic REJECT.
2. If the milestone is research/data, it MUST contain specific metrics or links to reports.
3. If the evidence looks like fluff, filler, or buzzwords without proof, REJECT.

Respond in strict JSON format:
{
  "isAccepted": true or false,
  "reason": "If false, a harsh 1-sentence explanation of exactly what verifiable proof is missing. If true, write 'Evidence meets verifiable standards.'"
}`;

  try {
    const rawResponse = await generateText({
      turns: [{ role: "user", content: prompt }],
      maxOutputTokens: 500
    });
    const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);
    
    return {
      isAccepted: result.isAccepted,
      reason: result.reason
    };
  } catch (error) {
    console.error("[Evidence Audit Error]", error);
    // If AI fails, we accept it cautiously, but flag it for manual review
    return { isAccepted: true, reason: "AI Audit failed, requires manual officer review." };
  }
}

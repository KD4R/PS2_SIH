import { generateJson, type JsonSchema } from "@/lib/ai/groq";
import { serverEnv } from "@/lib/server/env";

export const DIMENSIONS = [
  { key: "technicalFeasibility",    label: "Technical Feasibility",       description: "Is the solution technically mature enough for a government pilot? Does it work at scale?" },
  { key: "gfrCompliance",           label: "GFR 2017 Compliance",         description: "Does the pricing and procurement model comply with General Financial Rules 2017? Is it GeM-compatible?" },
  { key: "citizenImpact",           label: "Citizen Impact",              description: "Does it deliver measurable, direct benefit to citizens? Is it accessible to rural and marginalised groups?" },
  { key: "costEffectiveness",       label: "Cost-Effectiveness",          description: "Is the pilot cost justified? Is the unit economics sustainable for government scale-up?" },
  { key: "scalability",             label: "Scalability",                 description: "Can this scale to a district, state, or national level? Are there data localisation and interoperability risks?" },
] as const;

export type DimensionKey = typeof DIMENSIONS[number]["key"];

// Auto-reject thresholds
export const AUTO_REJECT_TOTAL = 40;      // if total score < 40 out of 100
export const AUTO_REJECT_DIMENSION = 8;  // if any single dimension < 8 out of 20

const DimensionalVerdictSchema: JsonSchema = {
  type: "object",
  properties: {
    scores: {
      type: "object",
      properties: {
        technicalFeasibility: { type: "integer", description: "Score 0-20 for technical feasibility" },
        gfrCompliance:        { type: "integer", description: "Score 0-20 for GFR 2017 compliance readiness" },
        citizenImpact:        { type: "integer", description: "Score 0-20 for citizen impact" },
        costEffectiveness:    { type: "integer", description: "Score 0-20 for cost effectiveness" },
        scalability:          { type: "integer", description: "Score 0-20 for scalability" },
      },
      required: ["technicalFeasibility", "gfrCompliance", "citizenImpact", "costEffectiveness", "scalability"],
    },
    rationale: {
      type: "object",
      properties: {
        technicalFeasibility: { type: "string", description: "One sentence rationale for the technical feasibility score." },
        gfrCompliance:        { type: "string", description: "One sentence rationale for the GFR compliance score." },
        citizenImpact:        { type: "string", description: "One sentence rationale for the citizen impact score." },
        costEffectiveness:    { type: "string", description: "One sentence rationale for the cost effectiveness score." },
        scalability:          { type: "string", description: "One sentence rationale for the scalability score." },
      },
      required: ["technicalFeasibility", "gfrCompliance", "citizenImpact", "costEffectiveness", "scalability"],
    },
    headline: {
      type: "string",
      description: "One punchy sentence (max 15 words) summarising the proposal's strongest point.",
    },
    strengths: {
      type: "array",
      items: { type: "string" },
      description: "Top 2 concrete strengths of this specific proposal.",
    },
    risks: {
      type: "array",
      items: { type: "string" },
      description: "Top 2 specific risks or gaps.",
    },
    recommendation: {
      type: "string",
      description: "2-3 sentence final recommendation for the department officer.",
    },
  },
  required: ["scores", "rationale", "headline", "strengths", "risks", "recommendation"],
};

export interface DimensionalScores {
  technicalFeasibility: number;
  gfrCompliance: number;
  citizenImpact: number;
  costEffectiveness: number;
  scalability: number;
}

export interface ProposalVerdict {
  scores: DimensionalScores;
  rationale: Record<DimensionKey, string>;
  totalScore: number;
  verdict: "STRONGLY_RECOMMENDED" | "RECOMMENDED" | "REVIEW_NEEDED" | "NOT_RECOMMENDED" | "AUTO_REJECTED";
  autoRejected: boolean;
  autoRejectionReasons: string[];
  headline: string;
  strengths: string[];
  risks: string[];
  recommendation: string;
}

function computeVerdict(scores: DimensionalScores): {
  totalScore: number;
  verdict: ProposalVerdict["verdict"];
  autoRejected: boolean;
  autoRejectionReasons: string[];
} {
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const autoRejectionReasons: string[] = [];

  // Hard auto-reject rules
  DIMENSIONS.forEach(({ key, label }) => {
    if (scores[key] < AUTO_REJECT_DIMENSION) {
      autoRejectionReasons.push(`${label} scored ${scores[key]}/20 (minimum is ${AUTO_REJECT_DIMENSION})`);
    }
  });
  if (totalScore < AUTO_REJECT_TOTAL) {
    autoRejectionReasons.push(`Total score ${totalScore}/100 is below the minimum threshold of ${AUTO_REJECT_TOTAL}`);
  }

  const autoRejected = autoRejectionReasons.length > 0;
  let verdict: ProposalVerdict["verdict"];
  if (autoRejected) {
    verdict = "AUTO_REJECTED";
  } else if (totalScore >= 85) {
    verdict = "STRONGLY_RECOMMENDED";
  } else if (totalScore >= 65) {
    verdict = "RECOMMENDED";
  } else if (totalScore >= 50) {
    verdict = "REVIEW_NEEDED";
  } else {
    verdict = "NOT_RECOMMENDED";
  }

  return { totalScore, verdict, autoRejected, autoRejectionReasons };
}

export async function generateProposalVerdict(
  challengeTitle: string,
  proposalText: string,
): Promise<ProposalVerdict> {
  const systemPrompt = `You are a senior government procurement AI evaluator for Smart India Hackathon 2026.
Evaluate startup proposals submitted against government department challenges.

Score each dimension independently on a 0-20 scale. Be strict and realistic:
- 0-7:  Unacceptable — critical gaps that disqualify the proposal
- 8-12: Below average — significant concerns that need addressing
- 13-16: Adequate — meets basic requirements with some gaps
- 17-20: Strong — clearly well-thought-out with evidence

DIMENSION RUBRIC:
1. Technical Feasibility (0-20): Is the technology proven? Is there a working prototype or just a concept? Can it integrate with NIC/Aadhaar/UMANG?
2. GFR 2017 Compliance (0-20): Is pricing transparent and per-unit? Can it be procured via GeM? Does it avoid proprietary lock-in?
3. Citizen Impact (0-20): Does it directly benefit citizens? Is it accessible in regional languages? Does it reach rural/marginalised groups?
4. Cost-Effectiveness (0-20): Is the pilot cost justified? Is the total cost of ownership reasonable for a government department?
5. Scalability (0-20): Can it scale to crore-scale users? Is data stored on Indian servers? Are APIs open and interoperable?

Be tough. A mediocre idea should score 8-12 per dimension. Reserve 17-20 for genuinely exceptional work.`;

  const userMessage = `Government Challenge: ${challengeTitle}

Startup Proposal:
${proposalText}

Score each dimension 0-20 with a one-sentence rationale. Then provide your overall verdict.`;

  const raw = await generateJson<{
    scores: DimensionalScores;
    rationale: Record<DimensionKey, string>;
    headline: string;
    strengths: string[];
    risks: string[];
    recommendation: string;
  }>({
    model: serverEnv.groqModel,
    systemPrompt,
    turns: [{ role: "user", content: userMessage }],
    responseSchema: DimensionalVerdictSchema,
    maxOutputTokens: 1200,
    temperature: 0.2,
  });

  const { totalScore, verdict, autoRejected, autoRejectionReasons } = computeVerdict(raw.scores);

  return {
    ...raw,
    totalScore,
    verdict,
    autoRejected,
    autoRejectionReasons,
  };
}

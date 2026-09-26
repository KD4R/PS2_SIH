import { generateJson, type JsonSchema } from "@/lib/ai/groq";
import { serverEnv } from "@/lib/server/env";

const SpamFilterSchema: JsonSchema = {
  type: "object",
  properties: {
    isSpam: {
      type: "boolean",
      description: "True if the proposal is obvious spam, gibberish, or clearly a joke/troll submission.",
    },
    reason: {
      type: "string",
      description: "A short reason why it was classified as spam, or empty if it is a valid proposal.",
    },
  },
  required: ["isSpam", "reason"],
};

export async function checkProposalSpam(proposalText: string) {
  if (!serverEnv.groqApiKey) return { isSpam: false }; // degrade gracefully if no AI configured

  const systemPrompt = `You are a strict initial filter for a government procurement hackathon.
Startups submit proposals to solve government challenges. 
Your job is ONLY to filter out absolute garbage, spam, gibberish, or obvious trolls (e.g. "asdfasdf", "I like turtles", "buy my crypto").
DO NOT reject weak, short, or badly formatted proposals if they are genuine attempts.
Return JSON matching the schema.`;

  return generateJson<{ isSpam: boolean; reason: string }>({
    model: serverEnv.groqDebateModel, // use the fast model for this
    systemPrompt,
    turns: [{ role: "user", content: `Proposal Text:\n${proposalText}` }],
    responseSchema: SpamFilterSchema,
    maxOutputTokens: 200,
    temperature: 0.1,
  });
}

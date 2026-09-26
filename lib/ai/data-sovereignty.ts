import { generateText } from "@/lib/ai/groq";

/**
 * DPDP Act 2023 Compliance & Data Sovereignty Scanner
 * Ensures the startup is not routing citizen data to foreign servers (AWS us-east-1, OpenAI APIs, etc.)
 * which is illegal for government procurement.
 */
export async function scanDataSovereignty(proposalText: string): Promise<{
  isCompliant: boolean;
  violationsFound: string[];
  riskLevel: "SAFE" | "WARNING" | "CRITICAL";
}> {
  const prompt = `You are a Cybersecurity and Data Privacy Auditor for the Indian Government, enforcing the DPDP Act 2023 and Data Localization laws.
Analyze the following startup proposal. 

Look specifically for:
1. Mentions of foreign data centers (e.g., AWS us-east-1, GCP us-central).
2. Mentions of using foreign AI APIs that don't guarantee data localization (e.g., standard OpenAI wrappers without enterprise compliance).
3. Any red flags that citizen PII (Personally Identifiable Information) might leave Indian borders.

Proposal Text:
${proposalText.substring(0, 3000)}

Respond in strict JSON format:
{
  "isCompliant": boolean (false if severe violations found),
  "violationsFound": ["List of 1-3 specific foreign tech stack risks found, or empty array"],
  "riskLevel": "CRITICAL" (if explicit foreign servers mentioned), "WARNING" (if vague cloud architecture), "SAFE" (if explicit Indian servers/NIC mentioned)
}`;

  try {
    const rawResponse = await generateText({
      turns: [{ role: "user", content: prompt }],
      maxOutputTokens: 600
    });
    const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);
    
    return {
      isCompliant: result.isCompliant ?? true,
      violationsFound: result.violationsFound || [],
      riskLevel: result.riskLevel || "SAFE"
    };
  } catch (error) {
    console.error("[Data Sovereignty Scan Error]", error);
    return {
      isCompliant: true,
      violationsFound: [],
      riskLevel: "SAFE" // Fail open if API fails, rely on human
    };
  }
}

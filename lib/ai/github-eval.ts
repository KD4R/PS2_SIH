import { generateText } from "@/lib/ai/groq";

/**
 * AI Github Codebase Evaluator (Anti-Faking Check)
 * Scans proposal text for github links. If found, it fetches the README and analyzes it
 * to see if the startup actually built deep-tech or is just wrapping an existing API.
 */
export async function evaluateDeepTechAuthenticity(proposalText: string): Promise<{ 
  isAuthentic: boolean; 
  repoFound: boolean;
  fraudRiskLevel: "LOW" | "MEDIUM" | "HIGH"; 
  analysis: string;
}> {
  // Extract github URL
  const githubRegex = /https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/i;
  const match = proposalText.match(githubRegex);
  
  if (!match) {
    return {
      isAuthentic: true, // Innocent until proven guilty if no repo is provided
      repoFound: false,
      fraudRiskLevel: "LOW",
      analysis: "No GitHub repository provided in the proposal."
    };
  }

  const repoUrl = match[0];
  const apiUrl = repoUrl.replace("github.com", "api.github.com/repos") + "/readme";
  
  let readmeText = "";
  try {
    const res = await fetch(apiUrl, {
      headers: { "Accept": "application/vnd.github.v3.raw" }
    });
    if (res.ok) {
      readmeText = await res.text();
    } else {
      readmeText = "Could not fetch README or repo is private.";
    }
  } catch (e) {
    readmeText = "Network error fetching README.";
  }

  const prompt = `You are a strict technical auditor for government hackathons.
Your job is to prevent "faking" by startups who claim to have built "Deep Tech" or "Custom AI" but are actually just using simple API wrappers (like OpenAI wrappers) or cloning standard templates.

Analyze this GitHub repository README and the proposal claims.

Repository URL: ${repoUrl}
README Content:
${readmeText.substring(0, 3000)} // Truncated for token limits

Based on this README, determine:
1. Are there signs of genuine engineering effort (custom training scripts, complex architectures, proprietary datasets)?
2. Or is it highly likely an empty repo, a direct clone, or a thin API wrapper?

Respond in strict JSON:
{
  "fraudRiskLevel": "HIGH" | "MEDIUM" | "LOW",
  "analysis": "Short 2 sentence explanation of your findings."
}`;

  try {
    const rawResponse = await generateText({
      turns: [{ role: "user", content: prompt }],
      maxOutputTokens: 800
    });
    const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);
    
    return {
      isAuthentic: result.fraudRiskLevel !== "HIGH",
      repoFound: true,
      fraudRiskLevel: result.fraudRiskLevel,
      analysis: result.analysis
    };
  } catch (error) {
    console.error("[Github Eval Error]", error);
    return {
      isAuthentic: true,
      repoFound: true,
      fraudRiskLevel: "LOW",
      analysis: "Error parsing repository data."
    };
  }
}

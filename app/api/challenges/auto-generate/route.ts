import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { callGroqDirect } from "@/lib/ai/groq";
import { z } from "zod";

const AutoGenerateRequestSchema = z.object({
  grievanceData: z.string().min(10, "Provide some grievance context or data"),
});

export async function POST(req: Request) {
  // OWASP: Broken Access Control - Only officers can generate challenges
  const { user, response } = await requireRole("department_officer");
  if (response) return response;

  try {
    const body = await req.json();
    
    // OWASP: Security Misconfiguration - Validate input strictly
    const { grievanceData } = AutoGenerateRequestSchema.parse(body);

    const systemPrompt = `You are a strategic AI advisor for the Government of Maharashtra.
Your goal is to transform raw, unstructured citizen grievances or complaint data into a structured, highly professional "Startup Challenge" (Reverse Pitch).

You must analyze the complaints, identify the root cause, and formulate an outcome-based problem statement for startups to solve.

You MUST respond in strict JSON matching this schema:
{
  "title": "A punchy, professional title (e.g., IoT Water Quality Monitoring System)",
  "domain": "The sector (e.g., Agriculture, Smart City, Healthcare)",
  "description": "A 2-paragraph problem description explaining the citizen pain points and the need for innovation.",
  "outcome": "What the successful pilot must achieve (e.g., 20% reduction in response time).",
  "budgetInr": 1500000, // Reasonable pilot budget integer between 500000 and 5000000
  "district": "Nashik (or infer from context if provided)"
}`;

    const userPrompt = `Generate a Startup Challenge based on this recent grievance data report:
${grievanceData}`;

    const rawResponse = await callGroqDirect([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], 1000);

    const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const challengeData = JSON.parse(cleaned);

    return NextResponse.json({ success: true, challenge: challengeData });

  } catch (error: any) {
    console.error("[Auto-Generate Challenge Error]", error.message);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message, code: "VALIDATION_ERROR" }, { status: 400 });
    }
    // OWASP: Sensitive Data Exposure - mask internal errors
    return NextResponse.json({ error: "Failed to generate challenge from grievances." }, { status: 500 });
  }
}

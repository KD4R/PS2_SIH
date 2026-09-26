import { callGroqDirect } from "@/lib/ai/groq";

/**
 * Mock Bhashini Translation API
 * In a real scenario, this would call the actual Bhashini API endpoints.
 * Here we use Groq to simulate the seamless translation of regional languages to English.
 */
export async function translateToEnglish(text: string): Promise<{ translatedText: string; originalLanguage: string }> {
  const prompt = `You are an expert linguist integrated with the Bhashini API.
Analyze the following text. If it is entirely in English, return it exactly as is, and output "English".
If it contains or is written in an Indian regional language (e.g., Hindi, Marathi, Tamil, Bengali), accurately translate the ENTIRE text to professional English.

You MUST respond in strict JSON format:
{
  "translatedText": "The english version of the text",
  "originalLanguage": "Marathi (or whichever language was detected)"
}

Text to process:
${text}`;

  try {
    const rawResponse = await callGroqDirect([{ role: "user", content: prompt }], 1000);
    
    // Clean up the response in case the model added markdown blocks
    const cleaned = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);
    
    return {
      translatedText: result.translatedText,
      originalLanguage: result.originalLanguage,
    };
  } catch (error) {
    console.error("[Bhashini Translation Error]", error);
    // Fallback to original text if translation fails
    return { translatedText: text, originalLanguage: "Unknown" };
  }
}

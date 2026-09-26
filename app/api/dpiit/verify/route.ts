import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const VerifyDpiitSchema = z.object({
  dpiitNumber: z.string().min(5).max(30).regex(/^[a-zA-Z0-9_-]+$/, "Invalid DPIIT format"),
});

export async function POST(req: Request) {
  // OWASP: Broken Access Control - Enforce strict RBAC
  const { user, response } = await requireRole("startup_founder");
  if (response) return response;

  try {
    const body = await req.json();
    
    // OWASP: Mass Assignment / Injection - Strictly parse inputs
    const { dpiitNumber } = VerifyDpiitSchema.parse(body);

    // Mock verification logic
    const isVerified = dpiitNumber.toUpperCase().startsWith("DIPP") || dpiitNumber.toUpperCase().startsWith("DPIIT");
    
    if (!isVerified) {
      return NextResponse.json({ 
        error: "Invalid DPIIT Registration Number. Must start with DIPP or DPIIT.",
        code: "INVALID_DPIIT"
      }, { status: 400 });
    }

    const supabase = await createClient();

    // OWASP: Broken Access Control - User can only update their own profile
    const { error } = await supabase
      .from("profiles")
      .update({
        dpiit_number: dpiitNumber.toUpperCase(),
        dpiit_verified: true,
      })
      .eq("id", user!.id);

    if (error) {
      console.error("[DPIIT Verify Error]", error.message);
      return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "DPIIT Number Verified. Sandbox policies & turnover waivers are now active for your account.",
      dpiitNumber: dpiitNumber.toUpperCase()
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues?.[0]?.message || "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    // OWASP: Sensitive Data Exposure - Don't leak raw stack traces
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function StartupOnboardingPage() {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [otherChecked, setOtherChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/dashboard/startup");
    }, 1500);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="glass w-full max-w-2xl rounded-2xl border border-border p-8 shadow-2xl bg-card">
        <div className="mb-4">
          <Link href="/" className="text-sm text-primary hover:underline flex items-center gap-2 w-fit">
            &larr; Back to Home
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold">Startup Profile Onboarding</h1>
          <p className="mt-2 text-sm text-muted-foreground">Complete your profile to discover and apply for government challenges.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Company / Startup Name</Label>
              <Input id="companyName" placeholder="e.g. TechNova Innovations" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dpiit">DPIIT / Startup India Number</Label>
              <div className="flex gap-2">
                <Input id="dpiit" placeholder="e.g. DIPP12345" required />
                <Button 
                  type="button" 
                  variant={verified ? "default" : "outline"} 
                  onClick={() => {
                    if (!verified) {
                      // Fake loading for verification
                      const btn = document.getElementById('verify-btn');
                      if (btn) btn.innerText = "Verifying...";
                      setTimeout(() => setVerified(true), 1000);
                    }
                  }}
                  id="verify-btn"
                >
                  {verified ? "Verified ✓" : "Verify"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sector / Domain (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-3 border border-input rounded-md p-3 max-h-[140px] overflow-y-auto bg-background">
                {["HealthTech", "AgriTech", "CivicTech", "FinTech", "ClimateTech", "Mobility", "Other"].map((sector) => (
                  <div key={sector} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id={sector} 
                      className="rounded border-gray-500 h-4 w-4 bg-transparent text-primary" 
                      onChange={(e) => {
                        if (sector === "Other") setOtherChecked(e.target.checked);
                      }}
                    />
                    <Label htmlFor={sector} className="text-sm font-normal cursor-pointer">
                      {sector}
                    </Label>
                  </div>
                ))}
              </div>
              {otherChecked && (
                <div className="pt-1">
                  <Input type="text" placeholder="Please specify (max 50 chars)" maxLength={50} required className="h-9 text-sm" />
                </div>
              )}
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="teamSize">Team Size</Label>
              <Input id="teamSize" type="number" min="1" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="years">Years of Operation</Label>
              <Input id="years" type="number" min="0" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gem">GeM Seller Registration Number</Label>
              <Input id="gem" placeholder="e.g. GEM123 (Optional)" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pitch">Short Pitch / One-line Description</Label>
            <Textarea id="pitch" maxLength={150} placeholder="Describe your solution in one sentence (max 150 chars)" required />
          </div>

          <div className="space-y-1.5">
            <Label>Document Uploads (PDF)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 bg-muted/10 hover:bg-muted/30 transition-colors">
                <Label htmlFor="cert" className="cursor-pointer text-sm font-medium text-primary hover:underline">Upload Incorporation Certificate</Label>
                <input id="cert" type="file" accept=".pdf" className="hidden" />
              </div>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 bg-muted/10 hover:bg-muted/30 transition-colors">
                <Label htmlFor="dpiitCert" className="cursor-pointer text-sm font-medium text-primary hover:underline">Upload DPIIT Certificate</Label>
                <input id="dpiitCert" type="file" accept=".pdf" className="hidden" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Setting up profile..." : "Continue to dashboard"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}

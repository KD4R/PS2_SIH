"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GovOnboardingPage() {
  const router = useRouter();
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/dashboard/gov");
    }, 1500);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <section className="glass w-full max-w-xl rounded-2xl border border-border p-8 shadow-2xl bg-card">
        <div className="mb-4">
          <Link href="/" className="text-sm text-primary hover:underline flex items-center gap-2 w-fit">
            &larr; Back to Home
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold">Government Officer Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">Set up your department profile to post challenges and discover innovators.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="e.g. Rahul Sharma" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" placeholder="e.g. Joint Secretary" required />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="department">Department Name</Label>
              <select
                id="department"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select a department...</option>
                <option value="it">Ministry of Electronics and IT</option>
                <option value="health">Ministry of Health</option>
                <option value="agri">Ministry of Agriculture</option>
                <option value="urban">Ministry of Housing and Urban Affairs</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="state">State</Label>
              <select
                id="state"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select State</option>
                <option value="delhi">Delhi</option>
                <option value="maharashtra">Maharashtra</option>
                <option value="karnataka">Karnataka</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="district">District</Label>
              <Input id="district" placeholder="e.g. New Delhi" required />
            </div>
          </div>

          <div className="space-y-4 border rounded-lg p-5 bg-muted/30">
            <h3 className="text-sm font-semibold">Government Email Verification</h3>
            {!otpVerified ? (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Input placeholder="Enter gov email for verification OTP" type="email" />
                  <Button type="button" variant="secondary" onClick={() => setOtpSent(true)}>Send OTP</Button>
                </div>
                {otpSent && (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                    <Input placeholder="Enter OTP (e.g. 123456)" />
                    <Button type="button" onClick={() => setOtpVerified(true)}>Verify</Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-green-600 font-medium flex items-center gap-2">
                <span className="flex h-6 w-6 rounded-full bg-green-100 items-center justify-center">✓</span> 
                Email successfully verified
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Employee ID / Designation Proof (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/10 hover:bg-muted/30 transition-colors mt-2">
              <Label htmlFor="idProof" className="cursor-pointer text-sm font-medium text-primary hover:underline">Upload ID Card (PDF/Image)</Label>
              <input id="idProof" type="file" className="hidden" />
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

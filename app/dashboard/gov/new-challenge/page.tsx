"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export default function NewChallengePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [rewritten, setRewritten] = useState(false);

  return (
    <div className="min-h-screen bg-muted/20 pb-10">
      <header className="h-16 border-b bg-card flex items-center px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>← Back</Button>
          <h1 className="text-lg font-semibold">Post a New Challenge</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-10">
        <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
          {/* Progress bar */}
          <div className="flex border-b bg-muted/10">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className={`flex-1 h-1.5 ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>

          <div className="p-8">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <h2 className="text-2xl font-bold mb-2">1. Problem Description</h2>
                  <p className="text-muted-foreground text-sm">Describe the challenge you are trying to solve in plain English.</p>
                </div>
                <div className="space-y-2">
                  <Label>Free text description</Label>
                  <Textarea placeholder="e.g. Traffic in downtown is chaotic during peak hours..." className="min-h-[200px]" />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button onClick={() => setStep(2)}>Next Step</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">2. Outcome-based Statement</h2>
                    <p className="text-muted-foreground text-sm">Define what success looks like.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setRewritten(true)} className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                    ✨ AI-assist rewrite
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label>Current State</Label>
                    <Textarea defaultValue={rewritten ? "Average waiting time at intersections is 5 mins." : ""} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Desired Outcome</Label>
                    <Textarea defaultValue={rewritten ? "Reduce intersection waiting time by 40%." : ""} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Success Metric</Label>
                      <Input defaultValue={rewritten ? "Wait time (minutes)" : ""} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Success Threshold</Label>
                      <Input defaultValue={rewritten ? "< 3 minutes" : ""} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)}>Next Step</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <h2 className="text-2xl font-bold mb-2">3. Budget & Duration</h2>
                  <p className="text-muted-foreground text-sm">Set expectations for the pilot.</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Budget Range (₹ Lakhs)</Label>
                    <div className="flex gap-4 items-center">
                      <Input type="number" placeholder="Min" />
                      <span>to</span>
                      <Input type="number" placeholder="Max" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Pilot Duration (Months)</Label>
                    <Input type="number" placeholder="e.g. 3" />
                  </div>
                </div>
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={() => setStep(4)}>Next Step</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <h2 className="text-2xl font-bold mb-2">4. Eligibility Criteria</h2>
                  <p className="text-muted-foreground text-sm">Select standard waivers for startups.</p>
                </div>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/30 cursor-pointer">
                    <input type="checkbox" className="mt-1 h-4 w-4" defaultChecked />
                    <div>
                      <p className="font-medium">Waive prior experience</p>
                      <p className="text-sm text-muted-foreground">Allows new startups to apply.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/30 cursor-pointer">
                    <input type="checkbox" className="mt-1 h-4 w-4" defaultChecked />
                    <div>
                      <p className="font-medium">Waive minimum turnover</p>
                      <p className="text-sm text-muted-foreground">Removes financial barriers for early-stage innovators.</p>
                    </div>
                  </label>
                </div>
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                  <Button onClick={() => setStep(5)}>Next Step</Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <h2 className="text-2xl font-bold mb-2">5. Attach Templates</h2>
                  <p className="text-muted-foreground text-sm">Select auto-suggested legal and compliance templates.</p>
                </div>
                <div className="grid gap-3">
                  {["Problem statement template", "Data/IP clause template", "Pilot agreement template"].map((t) => (
                    <div key={t} className="flex items-center justify-between p-3 border rounded bg-card">
                      <span className="font-medium text-sm flex items-center gap-2"><span className="text-primary">📄</span> {t}</span>
                      <Button variant="ghost" size="sm" className="text-blue-600">Edit</Button>
                    </div>
                  ))}
                </div>
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
                  <Button onClick={() => setStep(6)}>Review</Button>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-center py-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 text-2xl">✓</div>
                  <h2 className="text-2xl font-bold mb-2">Ready to Publish</h2>
                  <p className="text-muted-foreground text-sm mb-6">Your challenge is ready to go live on the discovery platform.</p>
                  
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => setStep(5)}>Edit Details</Button>
                    <Button onClick={() => router.push("/dashboard/gov")} className="bg-green-600 hover:bg-green-700">Publish Challenge</Button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CircleCheck, Download, Eye, PartyPopper, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDemoStore } from "@/lib/demo/store";
import { seed } from "@/lib/demo/store";
import { useToast } from "@/lib/demo/toast";
import { downloadTemplatePdf } from "@/lib/demo/pdf";
import { cn } from "@/lib/utils";

const AI_REWRITE = {
  current:
    "The current monitoring process is manual and slow; problems are detected late and often after citizen complaints.",
  desired:
    "Detect and localise every quality event within 6 hours of onset across all 40 monitoring points, with automated alerts to the control room and field crews.",
  metric: "Mean detection time (hours)",
  threshold: "< 6 hours",
};

export default function NewChallengePage() {
  const router = useRouter();
  const { toast } = useToast();
  const templates = useDemoStore((s) => s.templates);
  const publishChallenge = useDemoStore((s) => s.publishChallenge);

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [current, setCurrent] = useState("");
  const [desired, setDesired] = useState("");
  const [metric, setMetric] = useState("");
  const [threshold, setThreshold] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [duration, setDuration] = useState("");
  const [waiveExp, setWaiveExp] = useState(true);
  const [waiveTurnover, setWaiveTurnover] = useState(true);
  const [selectedTpl, setSelectedTpl] = useState<string[]>(["tpl-problem", "tpl-pilot", "tpl-dataip"]);
  const [rewriting, setRewriting] = useState(false);
  const [rewritten, setRewritten] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [published, setPublished] = useState<string | null>(null);

  const domainOptions = ["Water & Sanitation", "Smart Mobility", "Agritech", "Healthtech", "Cleantech", "Urban Affairs"];
  const [domain, setDomain] = useState(domainOptions[0] ?? "Water & Sanitation");
  const [district, setDistrict] = useState("North Delhi");

  const canPublish = title.trim() && desired.trim() && budgetMin && budgetMax && duration;

  const aiRewrite = () => {
    setRewriting(true);
    setTimeout(() => {
      setCurrent(AI_REWRITE.current);
      setDesired(AI_REWRITE.desired);
      setMetric(AI_REWRITE.metric);
      setThreshold(AI_REWRITE.threshold);
      setRewriting(false);
      setRewritten(true);
      toast("Outcome statement improved with AI assist", "info");
    }, 1500);
  };

  const publish = () => {
    const challenge = publishChallenge({
      title: title.trim(),
      department: seed.CURRENT_USER.gov.department,
      domain,
      district,
      problemStatement: description.trim() || current.trim(),
      outcomeStatement: desired.trim(),
      budgetMin: Math.round(Number(budgetMin) * 100_000),
      budgetMax: Math.round(Number(budgetMax) * 100_000),
      durationMonths: Number(duration),
      eligibility: [
        "DPIIT-recognised startup (turnover & prior-experience relaxations apply)",
        ...(waiveExp ? [] : ["Prior experience of 3 years required"]),
        ...(waiveTurnover ? [] : ["Minimum turnover applies"]),
      ],
      templateIds: selectedTpl,
    });
    setPublished(challenge.id);
  };

  const steps = ["Problem description", "Outcome statement", "Budget & duration", "Eligibility", "Templates", "Review"];
  const selectedTemplates = useMemo(() => templates.filter((t) => selectedTpl.includes(t.id)), [templates, selectedTpl]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-20 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-4 px-6">
          <Button variant="ghost" size="sm" onClick={() => published ? router.push("/dashboard/gov") : router.back()}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-lg font-semibold">Post a new challenge</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {published ? (
          /* Success screen */
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-card p-10 text-center animate-in fade-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <PartyPopper className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">Challenge published</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              “{title}” is now live on the startup Demand Radar. You will start receiving proposals in your inbox.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => router.push("/dashboard/gov")}>Back to dashboard</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard/startup")}>
                See the startup view
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Stepper */}
            <div className="flex border-b border-border bg-muted/10">
              {steps.map((label, i) => (
                <div key={label} className="flex-1">
                  <div className={cn("h-1.5", i + 1 <= step ? "bg-primary" : "bg-muted")} />
                  <p className={cn("px-2 pt-2 text-[10px] font-medium", i + 1 === step ? "text-primary" : "text-muted-foreground")}>
                    {i + 1}. {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-8">
              {step === 1 && (
                <StepShell title="1. Problem description" sub="Describe the challenge in plain language.">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Challenge title</Label>
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Water Quality Sensor Network" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Free-text description</Label>
                      <Textarea className="min-h-40" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the operational problem, affected citizens, and current process…" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Domain</Label>
                        <select value={domain} onChange={(e) => setDomain(e.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40">
                          {domainOptions.map((d) => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>District</Label>
                        <Input value={district} onChange={(e) => setDistrict(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </StepShell>
              )}

              {step === 2 && (
                <StepShell title="2. Outcome-based statement" sub="Define what success looks like — the pilot is judged against this.">
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-50" onClick={aiRewrite} disabled={rewriting}>
                        <Sparkles className={cn("h-4 w-4", rewriting && "animate-pulse")} />
                        {rewriting ? "Rewriting…" : rewritten ? "Rewritten with AI" : "Rewrite with AI"}
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Current state</Label>
                      <Textarea value={current} onChange={(e) => setCurrent(e.target.value)} className="min-h-20" placeholder="How does the process work today?" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Desired outcome</Label>
                      <Textarea value={desired} onChange={(e) => setDesired(e.target.value)} className="min-h-20" placeholder="What measurable outcome should the pilot deliver?" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Success metric</Label>
                        <Input value={metric} onChange={(e) => setMetric(e.target.value)} placeholder="e.g. Mean detection time" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Success threshold</Label>
                        <Input value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="e.g. < 6 hours" />
                      </div>
                    </div>
                  </div>
                </StepShell>
              )}

              {step === 3 && (
                <StepShell title="3. Budget & duration" sub="Set expectations for the pilot.">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Budget range (₹ lakh)</Label>
                      <div className="flex items-center gap-4">
                        <Input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="Min" />
                        <span className="text-sm text-muted-foreground">to</span>
                        <Input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="Max" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Pilot duration (months)</Label>
                      <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 6" />
                    </div>
                  </div>
                </StepShell>
              )}

              {step === 4 && (
                <StepShell title="4. Eligibility criteria" sub="Select standard relaxations for startups.">
                  <div className="space-y-3">
                    <CheckRow checked={waiveExp} onChange={setWaiveExp} title="Waive prior experience" desc="Pilot-based evidence is accepted instead of past track record." />
                    <CheckRow checked={waiveTurnover} onChange={setWaiveTurnover} title="Waive minimum turnover" desc="Removes financial barriers for early-stage innovators." />
                    <CheckRow checked readOnly title="Exempt earnest money deposit (EMD)" desc="Standard for startup challenges on this platform." />
                  </div>
                </StepShell>
              )}

              {step === 5 && (
                <StepShell title="5. Attach templates" sub="Pre-cleared legal, evaluation and compliance formats.">
                  <div className="space-y-2.5">
                    {templates.map((t) => {
                      const on = selectedTpl.includes(t.id);
                      return (
                        <div key={t.id} className={cn("flex items-center justify-between rounded-lg border px-4 py-3 transition-colors", on ? "border-primary/50 bg-primary/5" : "border-border")}>
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() => setSelectedTpl((prev) => (on ? prev.filter((x) => x !== t.id) : [...prev, t.id]))}
                              className="h-4 w-4 accent-[hsl(var(--primary))]"
                            />
                            <span>
                              <span className="block text-sm font-medium">{t.title}</span>
                              <span className="block text-xs text-muted-foreground">{t.description}</span>
                            </span>
                          </label>
                          <div className="flex shrink-0 gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setPreview(t.id)}><Eye className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => downloadTemplatePdf(t)}><Download className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </StepShell>
              )}

              {step === 6 && (
                <StepShell title="6. Review & publish" sub="Check the details before the challenge goes live.">
                  <div className="space-y-4 text-sm">
                    <ReviewRow label="Title" value={title} />
                    <ReviewRow label="Outcome" value={desired} />
                    <ReviewRow label="Budget" value={`₹${Number(budgetMin || 0)}L – ₹${Number(budgetMax || 0)}L`} />
                    <ReviewRow label="Duration" value={`${duration} months`} />
                    <ReviewRow label="Eligibility waivers" value={[waiveExp && "prior experience", waiveTurnover && "minimum turnover", "EMD"].filter(Boolean).join(", ") + " waived"} />
                    <ReviewRow label="Templates attached" value={selectedTemplates.map((t) => t.title).join(", ") || "none"} />
                  </div>
                </StepShell>
              )}

              {/* Nav buttons */}
              <div className="mt-8 flex justify-between border-t border-border pt-6">
                <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
                  Back
                </Button>
                {step < 6 ? (
                  <Button onClick={() => setStep((s) => s + 1)}>Next step</Button>
                ) : (
                  <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={!canPublish} onClick={publish}>
                    <CircleCheck className="h-4 w-4" /> Publish challenge
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Template preview dialog */}
      <Dialog open={preview !== null} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{templates.find((t) => t.id === preview)?.title ?? "Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(templates.find((t) => t.id === preview)?.sections ?? []).map((s, i) => (
              <div key={i} className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-sm font-semibold">{i + 1}. {s.heading}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StepShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      </div>
      {children}
    </div>
  );
}

function CheckRow({ checked, onChange, title, desc, readOnly = false }: { checked: boolean; onChange?: (v: boolean) => void; title: string; desc: string; readOnly?: boolean }) {
  return (
    <label className={cn("flex items-start gap-3 rounded-lg border p-4 transition-colors", checked ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/30", !readOnly && "cursor-pointer")}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={readOnly}
        className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
      />
      <span>
        <span className="block font-medium">{title}</span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{desc}</span>
      </span>
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 rounded-lg border border-border bg-muted/20 px-4 py-3">
      <span className="w-40 shrink-0 text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}

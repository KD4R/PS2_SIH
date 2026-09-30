"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Check, CircleCheck, Copy, MapPin, PartyPopper, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/demo/dashboard-shell";
import { useDemoStore } from "@/lib/demo/store";
import { seed } from "@/lib/demo/store";
import { IntegrationBadge } from "@/components/demo/integration-badge";
import { useToast } from "@/lib/demo/toast";
import { fmtDate, fmtINR } from "@/lib/demo/format";
import { cn } from "@/lib/utils";
import type { ScaleDecision } from "@/lib/demo/types";

const NAV = [
  { key: "overview", label: "nav.overview", icon: MapPin, href: "/dashboard/gov" },
  { key: "pilots", label: "nav.pilots", icon: MapPin, href: "/dashboard/gov" },
];

const DISTRICTS = ["North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "Gurugram", "Noida", "Faridabad"];
const PATHWAY_STEPS = ["Validation", "Budget approval", "GeM listing / direct procurement", "Contract", "Rollout"];

type Outcome = ScaleDecision["outcome"];

export default function ScaleUpPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id;

  const hydrated = useDemoStore((s) => s.hydrated);
  const pilot = useDemoStore((s) => s.pilots.find((p) => p.id === id));
  const startup = useDemoStore((s) => s.startups.find((st) => st.id === pilot?.startupId));
  const challenge = useDemoStore((s) => s.challenges.find((c) => c.id === pilot?.challengeId));
  const decideScale = useDemoStore((s) => s.decideScale);

  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [districts, setDistricts] = useState<string[]>(["North Delhi", "South Delhi"]);
  const [gemSynced, setGemSynced] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!pilot || !startup || !challenge) {
    return (
      <DashboardShell role="gov" userName={seed.CURRENT_USER.gov.name} userSubtitle={seed.CURRENT_USER.gov.title} nav={NAV} activeKey="pilots" title="Scale-up decision">
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="font-medium">Pilot not found.</p>
          <Link href="/dashboard/gov" className="mt-3 inline-block text-sm text-primary hover:underline">Back to overview</Link>
        </div>
      </DashboardShell>
    );
  }

  const validationDone = pilot.validation?.status === "Completed";

  const confirm = () => {
    if (!outcome) return;
    const path =
      outcome === "Scale"
        ? `Phased rollout across ${districts.length} districts`
        : outcome === "Convert to procurement"
          ? gemSynced
            ? "Validated → budget approved → GeM listing → contract → rollout"
            : "Validated → budget approval → direct procurement route → contract → rollout"
          : "Pilot closed with findings published";
    decideScale(pilot.id, outcome, outcome === "Scale" ? districts : outcome === "Convert to procurement" ? [challenge.district] : [], path);
    setConfirmed(true);
    toast(`Decision recorded: ${outcome}`, "success");
  };

  return (
    <DashboardShell role="gov" userName={seed.CURRENT_USER.gov.name} userSubtitle={seed.CURRENT_USER.gov.title} nav={NAV} activeKey="pilots" title="Scale-up decision">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link href={`/dashboard/gov/pilots/${pilot.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to pilot
        </Link>

        {confirmed ? (
          /* Celebration */
          <section className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-card p-10 text-center animate-in fade-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <PartyPopper className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">Decision published</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              {pilot.scale?.outcome === "Scale"
                ? `${challenge.title} will roll out to ${pilot.scale.districts.join(", ")}. The startup, admin dashboard and public portal have been updated.`
                : pilot.scale?.outcome === "Convert to procurement"
                  ? `${challenge.title} enters the regular procurement pathway. The public portal now lists it as converted.`
                  : `${challenge.title} has been closed with findings published to the public portal.`}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button onClick={() => router.push("/dashboard/gov")}>Back to overview</Button>
              <Button variant="outline" onClick={() => router.push("/public")}>View public portal</Button>
            </div>
          </section>
        ) : (
          <>
            {/* Validation summary */}
            <section className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold">Independent validation</h3>
              {validationDone && pilot.validation ? (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                      <CircleCheck className="h-3.5 w-3.5" /> {pilot.validation.result ?? "Pass"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Validator: <strong className="text-foreground">{pilot.validation.validator}</strong>
                      {pilot.validation.date ? ` · ${fmtDate(pilot.validation.date)}` : ""}
                    </span>
                  </div>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {(pilot.validation.findings ?? []).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Validation is {pilot.validation?.status ?? "not started"}. The scale-up decision unlocks when the independent validator completes.
                </p>
              )}
            </section>

            {/* Option cards */}
            <section className={cn("grid grid-cols-1 gap-4 md:grid-cols-3", !validationDone && "pointer-events-none opacity-50")}>
              <OptionCard
                icon={<MapPin className="h-5 w-5" />}
                title="Scale to more districts"
                desc="Expand the validated solution to additional districts in phases."
                selected={outcome === "Scale"}
                onClick={() => setOutcome("Scale")}
              />
              <OptionCard
                icon={<Building2 className="h-5 w-5" />}
                title="Convert to procurement"
                desc="Move the solution into the department's regular procurement channel."
                selected={outcome === "Convert to procurement"}
                onClick={() => setOutcome("Convert to procurement")}
              />
              <OptionCard
                icon={<X className="h-5 w-5" />}
                title="Close pilot"
                desc="End the pilot and publish findings on the public portal."
                selected={outcome === "Close"}
                onClick={() => setOutcome("Close")}
              />
            </section>

            {/* Outcome forms */}
            {outcome === "Scale" && validationDone && (
              <section className="rounded-xl border border-border bg-card p-6 animate-in fade-in">
                <p className="text-sm font-semibold">Select districts for phased rollout</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DISTRICTS.map((d) => {
                    const on = districts.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDistricts((prev) => (on ? prev.filter((x) => x !== d) : [...prev, d]))}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {on && <Check className="mr-1 inline h-3 w-3" />}
                        {d}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Phased rollout preview</p>
                  <p className="mt-1">
                    Phase 1 (Q1): {districts.slice(0, 2).join(", ") || "—"} · Phase 2 (Q2): {districts.slice(2, 5).join(", ") || "—"} ·
                    Phase 3 (Q3): {districts.slice(5).join(", ") || "—"}
                  </p>
                </div>
              </section>
            )}

            {outcome === "Convert to procurement" && validationDone && (
              <section className="rounded-xl border border-border bg-card p-6 animate-in fade-in">
                <p className="text-sm font-semibold">Procurement pathway</p>
                <ol className="mt-4 space-y-3">
                  {PATHWAY_STEPS.map((step, i) => (
                    <li key={step} className="flex items-center gap-3">
                      <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", i === 0 ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground")}>
                        {i === 0 ? <Check className="h-4 w-4" /> : i + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                      {step.includes("GeM") && (
                        <span className="ml-auto">
                          <IntegrationBadge kind="gem" verified={gemSynced} onSync={() => toast("Scope imported from GeM", "info")} />
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {outcome === "Close" && validationDone && (
              <section className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground animate-in fade-in">
                Closing publishes the pilot findings, KPI outcomes and validation report to the public transparency portal. Pending
                milestones are cancelled.
              </section>
            )}

            {/* Confirm bar */}
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                {outcome ? `Record decision: ${outcome}` : "Select an outcome to continue"}
              </p>
              <Button disabled={!outcome || !validationDone} onClick={confirm}>
                Confirm decision
              </Button>
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function OptionCard({
  icon,
  title,
  desc,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
        selected ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border bg-card",
      )}
    >
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
        {icon}
      </span>
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      {selected && (
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
          <CircleCheck className="h-3.5 w-3.5" /> Selected
        </p>
      )}
    </button>
  );
}

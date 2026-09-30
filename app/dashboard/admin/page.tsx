"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, FileStack, ScrollText, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell, type ShellNavItem } from "@/components/demo/dashboard-shell";
import { StatusPill } from "@/components/demo/status-pill";
import { AuditTimeline } from "@/components/demo/audit-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { useDemoStore } from "@/lib/demo/store";
import { seed } from "@/lib/demo/store";
import { useToast } from "@/lib/demo/toast";
import { fmtDate, fmtINR } from "@/lib/demo/format";

const NAV: ShellNavItem[] = [
  { key: "overview", label: "nav.overview", icon: ShieldCheck },
  { key: "validation", label: "nav.validation", icon: ClipboardCheck },
  { key: "access", label: "nav.access", icon: UserPlus },
  { key: "audit", label: "nav.audit", icon: ScrollText },
  { key: "templates", label: "nav.templates", icon: FileStack, href: "/dashboard/templates" },
];

type TabKey = "overview" | "validation" | "access" | "audit";

const VALIDATORS = ["Tata Consultancy Services — Quality Council", "IIT Delhi — Centre for Technology", "Bureau Veritas India", "Dr. Meera Krishnan (Independent)"];

export default function AdminDashboard() {
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>("overview");

  const hydrated = useDemoStore((s) => s.hydrated);
  const pilots = useDemoStore((s) => s.pilots);
  const challenges = useDemoStore((s) => s.challenges);
  const startups = useDemoStore((s) => s.startups);
  const auditLog = useDemoStore((s) => s.auditLog);
  const assignValidator = useDemoStore((s) => s.assignValidator);
  const completeValidation = useDemoStore((s) => s.completeValidation);

  const queue = useMemo(
    () => pilots.filter((p) => ["Pilot Completed", "In Validation", "Validated"].includes(p.status) || p.validation?.status === "Queued" || p.validation?.status === "Assigned"),
    [pilots],
  );

  const [accessRequests, setAccessRequests] = useState([
    { id: "ar-1", name: "Rajesh Kumar (Department Officer)", details: "Health Ministry, MP — verified domain email" },
    { id: "ar-2", name: "Kavita Rao (Evaluator)", details: "NIT Trichy — empanelled technical assessor" },
  ]);

  return (
    <DashboardShell
      role="admin"
      userName={seed.CURRENT_USER.admin.name}
      userSubtitle={`${seed.CURRENT_USER.admin.title}, ${seed.CURRENT_USER.admin.department}`}
      nav={NAV}
      activeKey={tab}
      onTabSelect={(k) => setTab(k as TabKey)}
      title="Programme administration"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {!hydrated ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: "System-wide pilot success", value: "68%", delta: "+12% vs last year" },
                { label: "Avg time-to-pilot", value: "42 days", delta: "-8 days vs last year" },
                { label: "Value in active pilots", value: fmtINR(pilots.filter((p) => p.status !== "Closed").reduce((s, p) => s + p.contractValue, 0)), delta: "across departments" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm font-medium text-muted-foreground">{m.label}</p>
                  <p className="mt-2 text-3xl font-bold">{m.value}</p>
                  <p className="mt-1 text-xs font-medium text-green-600">{m.delta}</p>
                </div>
              ))}
            </div>

            {tab === "overview" && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-3.5">
                    <h3 className="font-semibold">Validation queue snapshot</h3>
                  </div>
                  <div className="divide-y divide-border">
                    {queue.slice(0, 3).map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium">{challenges.find((c) => c.id === p.challengeId)?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {startups.find((s) => s.id === p.startupId)?.name} · {p.validation?.status ?? "Not queued"}
                          </p>
                        </div>
                        <StatusPill status={p.status} />
                      </div>
                    ))}
                    {queue.length === 0 && <div className="p-6"><EmptyState compact title="Queue empty" description="Completed pilots appear here for validation." /></div>}
                  </div>
                </section>

                <section className="rounded-xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-3.5">
                    <h3 className="font-semibold">Recent platform activity</h3>
                  </div>
                  <div className="p-5">
                    <AuditTimeline events={auditLog} limit={6} />
                  </div>
                </section>
              </div>
            )}

            {tab === "validation" && (
              <section className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                  <h3 className="font-semibold">Independent validation queue</h3>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{queue.length} pilots</span>
                </div>
                <div className="divide-y divide-border">
                  {queue.length === 0 && (
                    <div className="p-10"><EmptyState icon={ClipboardCheck} title="Queue is empty" description="When a department marks a pilot completed it lands here." /></div>
                  )}
                  {queue.map((p) => (
                    <div key={p.id} className="px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{challenges.find((c) => c.id === p.challengeId)?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {startups.find((s) => s.id === p.startupId)?.name} · {fmtINR(p.contractValue)} · completed {fmtDate(p.endDate)}
                          </p>
                        </div>
                        <StatusPill status={p.status} />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/20 p-3">
                        {p.validation?.status === "Assigned" || p.validation?.status === "Completed" ? (
                          <>
                            <span className="text-xs text-muted-foreground">
                              Validator: <strong className="text-foreground">{p.validation.validator}</strong> · status {p.validation.status}
                            </span>
                            {p.validation.status === "Assigned" && (
                              <Button
                                size="sm"
                                className="ml-auto"
                                onClick={() => {
                                  completeValidation(
                                    p.id,
                                    "Pass with conditions",
                                    [
                                      "Detection-time KPI met with margin (7h vs 6h target) — sustained monitoring recommended through monsoon season.",
                                      "Sensor uptime exceeded target (94% vs 90%); two gateway reinforcement sites still pending in Zone 4.",
                                      "False alarm rate within limit (3.2% vs 5%); recommend quarterly threshold re-tuning.",
                                    ],
                                  );
                                  toast("Validation completed — scale-up decision unlocked for the department", "success");
                                }}
                              >
                                Record validation result
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-muted-foreground">Assign an independent validator:</span>
                            <select
                              className="h-8 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-primary/40"
                              defaultValue={VALIDATORS[0]}
                              onChange={(e) => {
                                assignValidator(p.id, e.target.value);
                                toast(`Validator assigned: ${e.target.value}`, "success");
                              }}
                            >
                              {VALIDATORS.map((v) => <option key={v}>{v}</option>)}
                            </select>
                            <Button
                              size="sm"
                              className="ml-auto"
                              onClick={() => {
                                assignValidator(p.id, VALIDATORS[0] ?? "Independent validator");
                                toast("Validator assigned — department notified", "success");
                              }}
                            >
                              Assign validator
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "access" && (
              <section className="rounded-xl border border-border bg-card">
                <div className="border-b border-border px-5 py-3.5">
                  <h3 className="font-semibold">User access requests</h3>
                </div>
                <div className="divide-y divide-border">
                  {accessRequests.length === 0 && (
                    <div className="p-10"><EmptyState icon={UserPlus} title="No pending requests" description="New department and evaluator accounts will request access here." /></div>
                  )}
                  {accessRequests.map((r) => (
                    <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                      <div>
                        <p className="text-sm font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.details}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setAccessRequests((prev) => prev.filter((x) => x.id !== r.id));
                            toast(`Access request from ${r.name} rejected`, "warning");
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            setAccessRequests((prev) => prev.filter((x) => x.id !== r.id));
                            toast(`${r.name} approved`, "success");
                          }}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "audit" && (
              <section className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-semibold">Platform audit log</h3>
                <AuditTimeline events={auditLog} searchable />
              </section>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

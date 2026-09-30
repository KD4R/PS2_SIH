"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AppNotification,
  AuditEvent,
  Challenge,
  DemoState,
  Evaluation,
  Milestone,
  Pilot,
  Proposal,
  Role,
  Startup,
} from "./types";
import * as seed from "./seed";

const STORE_KEY = "govprocure-demo-v1";

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

function fmtINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export interface NewChallengeInput {
  title: string;
  department: string;
  domain: string;
  district: string;
  problemStatement: string;
  outcomeStatement: string;
  budgetMin: number;
  budgetMax: number;
  durationMonths: number;
  eligibility: string[];
  templateIds: string[];
}

export interface NewProposalInput {
  challengeId: string;
  startupId: string;
  summary: string;
  costEstimate: number;
  timelineMonths: number;
}

type Actions = {
  setHydrated: (v: boolean) => void;
  setLang: (lang: DemoState["lang"]) => void;
  resetDemo: () => void;

  publishChallenge: (input: NewChallengeInput) => Challenge;
  submitProposal: (input: NewProposalInput) => Proposal;
  startEvaluation: (proposalId: string) => void;
  completeEvaluation: (proposalId: string, evaluation: Evaluation) => void;
  submitEvaluatorScores: (proposalId: string, scores: Record<string, number>) => void;
  approveProposal: (proposalId: string) => Pilot | null;
  rejectProposal: (proposalId: string, reason: string) => void;

  submitEvidence: (milestoneId: string, fileName: string) => void;
  approveMilestone: (milestoneId: string) => void;
  rejectMilestone: (milestoneId: string, reason: string) => void;
  setCompliance: (pilotId: string, patch: { vaptDone: boolean; dsaSigned: boolean }) => void;
  toggleKillSwitch: (pilotId: string) => void;
  markPilotCompleted: (pilotId: string) => void;
  sendForValidation: (pilotId: string) => void;
  assignValidator: (pilotId: string, validator: string) => void;
  completeValidation: (pilotId: string, result: NonNullable<Pilot["validation"]>["result"], findings: string[]) => void;
  decideScale: (pilotId: string, outcome: NonNullable<Pilot["scale"]>["outcome"], districts: string[], pathway: string) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (role: Role) => void;
};

export type DemoStore = DemoState & Actions;

function freshState(): DemoState {
  return {
    challenges: seed.challenges,
    startups: seed.startups,
    proposals: seed.proposals,
    pilots: seed.pilots,
    templates: seed.templates,
    auditLog: seed.auditLog,
    notifications: seed.notifications,
    evaluatorScores: {},
    hydrated: false,
    lang: "en",
  };
}

function audit(s: DemoState, actor: string, role: Role, action: string, entity: string, entityId: string): AuditEvent {
  const event: AuditEvent = { id: uid("au"), at: nowISO(), actor, role, action, entity, entityId };
  s.auditLog = [event, ...s.auditLog];
  return event;
}

function notify(s: DemoState, forRole: Role, text: string, href?: string) {
  const n: AppNotification = { id: uid("nt"), forRole, text, at: nowISO(), read: false, href };
  s.notifications = [n, ...s.notifications];
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      ...freshState(),

      setHydrated: (v) => set({ hydrated: v }),
      setLang: (lang) => set({ lang }),
      resetDemo: () => {
        try {
          window.localStorage.removeItem(STORE_KEY);
        } catch {}
        set({ ...freshState(), hydrated: true });
      },

      publishChallenge: (input) => {
        const challenge: Challenge = {
          ...input,
          id: uid("ch"),
          deadline: new Date(Date.now() + 30 * 86_400_000).toISOString(),
          status: "Open",
        };
        set((s) => {
          const next = { ...s, challenges: [challenge, ...s.challenges] };
          audit(next, seed.CURRENT_USER.gov.name, "gov", "Published challenge", "Challenge", challenge.id);
          notify(next, "startup", `New open challenge in ${challenge.domain}: ${challenge.title}`, "/dashboard/startup");
          return next;
        });
        return challenge;
      },

      submitProposal: (input) => {
        const proposal: Proposal = {
          ...input,
          id: uid("pr"),
          status: "Submitted",
          fitScore: Math.round(55 + Math.random() * 35),
          submittedAt: nowISO(),
        };
        set((s) => {
          const next = { ...s, proposals: [proposal, ...s.proposals] };
          const startup = s.startups.find((st) => st.id === input.startupId);
          audit(next, startup?.name ?? "Startup", "startup", "Submitted proposal", "Proposal", proposal.id);
          notify(next, "gov", `New proposal from ${startup?.name ?? "a startup"} awaiting triage`, "/dashboard/gov");
          return next;
        });
        return proposal;
      },

      startEvaluation: (proposalId) => {
        set((s) => {
          const next = {
            ...s,
            proposals: s.proposals.map((p) => (p.id === proposalId ? { ...p, status: "Evaluating" as const } : p)),
          };
          audit(next, seed.CURRENT_USER.evaluator.name, "evaluator", "Started evaluation", "Proposal", proposalId);
          return next;
        });
      },

      completeEvaluation: (proposalId, evaluation) => {
        set((s) => {
          const next = {
            ...s,
            proposals: s.proposals.map((p) =>
              p.id === proposalId ? { ...p, status: "Evaluated" as const, evaluation } : p,
            ),
          };
          audit(next, seed.CURRENT_USER.evaluator.name, "evaluator", `AI evaluation complete — score ${evaluation.total}/100`, "Proposal", proposalId);
          notify(next, "gov", `Evaluation complete: score ${evaluation.total}/100 — ${evaluation.verdict}`, "/dashboard/gov");
          return next;
        });
      },

      submitEvaluatorScores: (proposalId, scores) => {
        set((s) => {
          const next = { ...s, evaluatorScores: { ...s.evaluatorScores, [proposalId]: scores } };
          const proposal = s.proposals.find((p) => p.id === proposalId);
          if (proposal?.evaluation) {
            const withScores = { ...proposal.evaluation, evaluatorScores: scores };
            next.proposals = next.proposals.map((p) => (p.id === proposalId ? { ...p, evaluation: withScores } : p));
          }
          audit(next, seed.CURRENT_USER.evaluator.name, "evaluator", "Submitted independent scores", "Proposal", proposalId);
          notify(next, "gov", "Independent evaluator scores submitted", "/dashboard/gov");
          return next;
        });
      },

      approveProposal: (proposalId) => {
        const s = get();
        const proposal = s.proposals.find((p) => p.id === proposalId);
        const challenge = s.challenges.find((c) => c.id === proposal?.challengeId);
        if (!proposal || !challenge) return null;

        const today = new Date();
        const plus = (days: number) => new Date(today.getTime() + days * 86_400_000).toISOString();
        const pilot: Pilot = {
          id: uid("pil"),
          proposalId: proposal.id,
          challengeId: challenge.id,
          startupId: proposal.startupId,
          status: "Contract Signed",
          contractValue: proposal.costEstimate,
          startDate: today.toISOString(),
          endDate: plus(proposal.timelineMonths * 30),
          milestones: [
            { id: uid("ms"), pilotId: "", title: "Phase 1 — Setup & Installation", kpi: "Hardware/infrastructure live and reporting", paymentPct: 30, amount: Math.round(proposal.costEstimate * 0.3), dueDate: plus(30), status: "Pending" as const },
            { id: uid("ms"), pilotId: "", title: "Phase 2 — Dashboard & Operations", kpi: challenge.outcomeStatement, paymentPct: 40, amount: Math.round(proposal.costEstimate * 0.4), dueDate: plus(75), status: "Pending" as const },
            { id: uid("ms"), pilotId: "", title: "Phase 3 — Final Report & Handover", kpi: "Independent validation of outcome KPIs", paymentPct: 30, amount: Math.round(proposal.costEstimate * 0.3), dueDate: plus(150), status: "Pending" as const },
          ].map((m): Milestone => ({ ...m, pilotId: "" })),
          kpis: [
            { label: "Primary outcome", baseline: 48, target: 6, actual: 0, unit: "baseline vs target", lowerIsBetter: true },
          ],
          kpiSeries: [],
          risks: [],
          sandbox: {
            area: `${challenge.district} — ${challenge.title}`,
            durationWeeks: challenge.durationMonths * 4,
            budgetCap: proposal.costEstimate,
            exitCriteria: [challenge.outcomeStatement],
            killSwitchActive: false,
          },
          compliance: {
            dataResidency: "India",
            ipClause: "Startup retains IP; the department receives a perpetual, non-exclusive licence for departmental use.",
            vaptDone: false,
            dsaSigned: true,
            incidentContact: "security@startup.example",
            score: 60,
          },
        };
        pilot.milestones = pilot.milestones.map((m) => ({ ...m, pilotId: pilot.id }));

        set((prev) => {
          const next = {
            ...prev,
            pilots: [pilot, ...prev.pilots],
            proposals: prev.proposals.map((p) => (p.id === proposalId ? { ...p, status: "Active Pilot" as const } : p)),
          };
          const startup = prev.startups.find((st) => st.id === proposal.startupId);
          audit(next, seed.CURRENT_USER.gov.name, "gov", `Approved proposal for pilot (${fmtINR(pilot.contractValue)})`, "Proposal", proposalId);
          audit(next, seed.CURRENT_USER.gov.name, "gov", "Created pilot", "Pilot", pilot.id);
          notify(next, "startup", `Your proposal for ${challenge.title} is approved for pilot`, `/dashboard/startup/pilots/${pilot.id}`);
          return next;
        });
        return pilot;
      },

      rejectProposal: (proposalId, reason) => {
        set((s) => {
          const next = {
            ...s,
            proposals: s.proposals.map((p) => (p.id === proposalId ? { ...p, status: "Rejected" as const } : p)),
          };
          audit(next, seed.CURRENT_USER.gov.name, "gov", `Rejected proposal — ${reason}`, "Proposal", proposalId);
          notify(next, "startup", "Your proposal was not taken forward. Reason recorded.", "/dashboard/startup");
          return next;
        });
      },

      submitEvidence: (milestoneId, fileName) => {
        set((s) => {
          const next = {
            ...s,
            pilots: s.pilots.map((pilot) => ({
              ...pilot,
              milestones: pilot.milestones.map((m: Milestone) =>
                m.id === milestoneId ? { ...m, status: "Evidence Submitted" as const, evidenceName: fileName } : m,
              ),
            })),
          };
          const pilot = s.pilots.find((p) => p.milestones.some((m) => m.id === milestoneId));
          const ms = pilot?.milestones.find((m) => m.id === milestoneId);
          audit(next, seed.CURRENT_STARTUP.name, "startup", `Submitted evidence for ${ms?.title ?? "milestone"}`, "Milestone", milestoneId);
          notify(next, "gov", `${seed.CURRENT_STARTUP.name}: evidence submitted for ${ms?.title ?? "milestone"}`, pilot ? `/dashboard/gov/pilots/${pilot.id}` : "/dashboard/gov");
          return next;
        });
      },

      approveMilestone: (milestoneId) => {
        set((s) => {
          const next = {
            ...s,
            pilots: s.pilots.map((pilot) => ({
              ...pilot,
              milestones: pilot.milestones.map((m) =>
                m.id === milestoneId ? { ...m, status: "Payment Released" as const, releasedOn: nowISO() } : m,
              ),
            })),
          };
          const pilot = s.pilots.find((p) => p.milestones.some((m) => m.id === milestoneId));
          const ms = pilot?.milestones.find((m) => m.id === milestoneId);
          audit(next, seed.CURRENT_USER.gov.name, "gov", `Released payment ${fmtINR(ms?.amount ?? 0)}`, "Milestone", milestoneId);
          notify(next, "startup", `Payment of ${fmtINR(ms?.amount ?? 0)} released for ${ms?.title ?? "milestone"}`, pilot ? `/dashboard/startup/pilots/${pilot.id}` : "/dashboard/startup");
          return next;
        });
      },

      rejectMilestone: (milestoneId, reason) => {
        set((s) => {
          const next = {
            ...s,
            pilots: s.pilots.map((pilot) => ({
              ...pilot,
              milestones: pilot.milestones.map((m) => (m.id === milestoneId ? { ...m, status: "Rejected" as const } : m)),
            })),
          };
          audit(next, seed.CURRENT_USER.gov.name, "gov", `Rejected milestone evidence — ${reason}`, "Milestone", milestoneId);
          notify(next, "startup", "Milestone evidence was rejected. Please revise and resubmit.", "/dashboard/startup");
          return next;
        });
      },

      setCompliance: (pilotId, patch) => {
        set((s) => {
          const score = 30 + (patch.dsaSigned ? 30 : 0) + (patch.vaptDone ? 40 : 0);
          const next = {
            ...s,
            pilots: s.pilots.map((p) =>
              p.id === pilotId ? { ...p, compliance: { ...p.compliance, ...patch, score } } : p,
            ),
          };
          audit(next, seed.CURRENT_USER.gov.name, "gov", `Compliance checklist updated — score ${score}/100`, "Pilot", pilotId);
          return next;
        });
      },

      toggleKillSwitch: (pilotId) => {
        set((s) => {
          const active = s.pilots.find((p) => p.id === pilotId)?.sandbox.killSwitchActive ?? false;
          const next = {
            ...s,
            pilots: s.pilots.map((p) =>
              p.id === pilotId ? { ...p, sandbox: { ...p.sandbox, killSwitchActive: !active } } : p,
            ),
          };
          audit(next, seed.CURRENT_USER.gov.name, "gov", active ? "Kill switch deactivated" : "KILL SWITCH ACTIVATED — pilot frozen", "Pilot", pilotId);
          notify(next, "startup", active ? "Kill switch deactivated — pilot resumed" : "Kill switch activated — pilot frozen pending review", "/dashboard/startup");
          return next;
        });
      },

      markPilotCompleted: (pilotId) => {
        set((s) => {
          const next = {
            ...s,
            pilots: s.pilots.map((p) => (p.id === pilotId ? { ...p, status: "Pilot Completed" as const } : p)),
          };
          audit(next, seed.CURRENT_USER.gov.name, "gov", "Marked pilot completed", "Pilot", pilotId);
          notify(next, "admin", `Pilot completed — assign an independent validator`, `/dashboard/admin`);
          return next;
        });
      },

      sendForValidation: (pilotId) => {
        set((s) => {
          const next = {
            ...s,
            pilots: s.pilots.map((p) =>
              p.id === pilotId
                ? { ...p, status: "In Validation" as const, validation: { ...p.validation, status: "Queued" as const } }
                : p,
            ),
          };
          audit(next, seed.CURRENT_USER.gov.name, "gov", "Sent pilot for independent validation", "Pilot", pilotId);
          notify(next, "admin", "Pilot queued for validation", "/dashboard/admin");
          return next;
        });
      },

      assignValidator: (pilotId, validator) => {
        set((s) => {
          const next = {
            ...s,
            pilots: s.pilots.map((p) =>
              p.id === pilotId ? { ...p, validation: { ...p.validation, status: "Assigned" as const, validator } } : p,
            ),
          };
          audit(next, seed.CURRENT_USER.admin.name, "admin", `Assigned validator: ${validator}`, "Pilot", pilotId);
          notify(next, "gov", `Validator assigned for your pilot`, `/dashboard/gov/pilots/${pilotId}`);
          return next;
        });
      },

  completeValidation: (pilotId, result, findings) => {
    set((s) => {
      const finalResult = result ?? "Pass";
          const next = {
            ...s,
            pilots: s.pilots.map((p) =>
              p.id === pilotId
                ? {
                    ...p,
                    status: "Validated" as const,
                    validation: { status: "Completed" as const, validator: p.validation?.validator, result: finalResult, findings, date: nowISO() },
                  }
                : p,
            ),
          };
          audit(next, seed.CURRENT_USER.admin.name, "admin", `Validation complete — ${finalResult}`, "Pilot", pilotId);
          notify(next, "gov", `Independent validation ${finalResult.toLowerCase()} — scale-up decision unlocked`, `/dashboard/gov/pilots/${pilotId}/scale`);
          return next;
        });
      },

      decideScale: (pilotId, outcome, districts, pathway) => {
        set((s) => {
          const next = {
            ...s,
            pilots: s.pilots.map((p) =>
              p.id === pilotId
                ? {
                    ...p,
                    status: outcome === "Close" ? ("Closed" as const) : ("Scaled" as const),
                    scale: { outcome, districts, pathway, decidedOn: nowISO() },
                  }
                : p,
            ),
          };
          audit(next, seed.CURRENT_USER.gov.name, "gov", `Scale-up decision: ${outcome}`, "Pilot", pilotId);
          notify(next, "startup", `Scale-up decision recorded: ${outcome}`, "/dashboard/startup");
          notify(next, "admin", `Scale-up decision published: ${outcome}`, "/dashboard/admin");
          return next;
        });
      },

      markNotificationRead: (id) => {
        set((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }));
      },

      markAllNotificationsRead: (role) => {
        set((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.forRole === role ? { ...n, read: true } : n)),
        }));
      },
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => {
        const { hydrated: _hydrated, ...rest } = state;
        return rest as DemoStore;
      },
    },
  ),
);

/* ---------- Selectors ---------- */

export function useRoleNotifications(role: Role): AppNotification[] {
  const notifications = useDemoStore((s) => s.notifications);
  return useMemo(() => notifications.filter((n) => n.forRole === role), [notifications, role]);
}

export interface PublicStats {
  challengesPublished: number;
  pilotsCompleted: number;
  avgDaysToPayment: number;
  totalValueAwarded: number;
}

export function usePublicStats(): PublicStats {
  const challenges = useDemoStore((s) => s.challenges);
  const pilots = useDemoStore((s) => s.pilots);
  const proposals = useDemoStore((s) => s.proposals);

  return useMemo(() => {
    const released = pilots.flatMap((p) => p.milestones.filter((m) => m.status === "Payment Released"));
    let avgDaysToPayment = 21;
    if (released.length > 0) {
      const days = released.map((m) => {
        const pilot = pilots.find((p) => p.milestones.includes(m));
        const start = pilot ? new Date(pilot.startDate).getTime() : Date.now();
        return Math.max(1, Math.round((new Date(m.releasedOn ?? Date.now()).getTime() - start) / 86_400_000));
      });
      avgDaysToPayment = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
    }
    return {
      challengesPublished: challenges.length,
      pilotsCompleted: pilots.filter((p) => ["Pilot Completed", "Validated", "Scaled"].includes(p.status)).length + 14,
      avgDaysToPayment,
      totalValueAwarded: pilots.filter((p) => p.status !== "Closed").reduce((sum, p) => sum + p.contractValue, 0) + 4_650_000,
    };
  }, [challenges, pilots, proposals]);
}

export { seed };

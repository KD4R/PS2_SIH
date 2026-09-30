/**
 * F19 — Data guard for GovProcure AI.
 *
 * Validates the seed dataset against the canonical story invariants and fails
 * if any user-visible copy leaks brand-banned words ("BoardroomAI",
 * "MahaInnovate", "lavda", the bare word "Demo") or contradicting amounts.
 *
 * Run: npm run check:data
 */
import {
  challenges,
  proposals,
  pilots,
  startups,
  templates,
  CURRENT_USER,
  CURRENT_STARTUP,
} from "../lib/demo/seed";
import { seed, useDemoStore } from "../lib/demo/store";
import type { KpiPoint, Milestone } from "../lib/demo/types";

let failures = 0;
function check(ok: boolean, label: () => string) {
  if (ok) {
    console.log(`  ok    ${label()}`);
  } else {
    failures += 1;
    console.error(`  FAIL  ${label()}`);
  }
}

console.log("\n== Brand-banned words in user-visible copy ==");
const BANNED = [/boardroom/i, /mahainnovate/i, /\blavda\b/i, /\bdemo\b/i];
const stringifyDeep = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || value === null || value === undefined) {
    return String(value);
  }
  if (Array.isArray(value)) return value.map(stringifyDeep).join(" ");
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).map(stringifyDeep).join(" ");
  }
  return "";
};
const userVisibleText = [
  stringifyDeep(challenges),
  stringifyDeep(proposals),
  stringifyDeep(pilots),
  stringifyDeep(startups),
  stringifyDeep(templates),
  stringifyDeep(CURRENT_USER),
  stringifyDeep(CURRENT_STARTUP),
].join(" ");
for (const pattern of BANNED) {
  check(!pattern.test(userVisibleText), () => `seed copy contains no /${pattern.source}/`);
}

console.log("\n== Core story invariants ==");
const water = challenges.find((c) => c.id === "ch-water-quality");
check(water !== undefined, () => "challenge ch-water-quality exists");
check(
  water?.budgetMin === 1_000_000 && water?.budgetMax === 1_500_000,
  () => "water challenge budget ₹10–15L"
);

const winning = proposals.find((p) => p.id === "pr-technova-water");
check(winning?.status === "Evaluated", () => `TechNova proposal Evaluated (got ${winning?.status})`);
check(winning?.evaluation?.total === 82, () => `TechNova weighted score 82 (got ${winning?.evaluation?.total})`);
check(
  (winning?.evaluation?.agentNotes?.length ?? 0) >= 5,
  () => `TechNova proposal has 5 agent notes (got ${winning?.evaluation?.agentNotes?.length ?? 0})`
);
check(
  winning?.startupId === CURRENT_STARTUP.id && CURRENT_STARTUP.name === "TechNova Innovations",
  () => "winner belongs to TechNova Innovations"
);

const pilot = pilots.find((p) => p.id === "pil-water");
check(pilot?.status === "In Progress" && pilot?.contractValue === 1_200_000, () => "pilot pil-water In Progress, ₹12,00,000");
const milestones: Milestone[] = pilot?.milestones ?? [];
check(milestones.length === 3, () => "pilot has 3 milestones");
const m1 = milestones[0];
const m2 = milestones[1];
const m3 = milestones[2];
check(m1?.title === "Hardware Setup" && m1?.paymentPct === 30 && m1?.amount === 360_000, () => "M1 Hardware Setup 30% ₹3.6L");
check(m1?.status === "Payment Released" && typeof m1?.releasedOn === "string", () => "M1 payment released");
check(m2?.title === "Data Dashboard" && m2?.paymentPct === 40 && m2?.amount === 480_000, () => "M2 Data Dashboard 40% ₹4.8L");
check(m2?.status === "Evidence Submitted" && typeof m2?.evidenceName === "string", () => "M2 evidence submitted");
check(m3?.title === "Final Report" && m3?.paymentPct === 30 && m3?.status === "Pending", () => "M3 Final Report 30% pending");
check(
  (m1?.amount ?? 0) + (m2?.amount ?? 0) + (m3?.amount ?? 0) === pilot?.contractValue,
  () => "milestone amounts sum to pilot value"
);
check(
  milestones.every((m) => m.paymentPct === Math.round((m.amount / (pilot?.contractValue || 1)) * 100)),
  () => "milestone paymentPct matches amount share"
);

console.log("\n== KPI invariants ==");
const kpis: KpiPoint[] = pilot?.kpis ?? [];
check(kpis.length >= 3, () => "pilot has at least 3 KPIs");
const detection = kpis.find((k) => /detection/i.test(k.label));
check(
  detection !== undefined && detection.baseline === 48 && detection.target === 6 && detection.actual === 7,
  () => "detection time 48h baseline → 6h target / 7h actual"
);
const uptime = kpis.find((k) => /uptime/i.test(k.label));
check(uptime !== undefined && uptime.target === 90 && uptime.actual === 94, () => "uptime target 90% / actual 94%");
const falseAlarm = kpis.find((k) => /false alarm/i.test(k.label));
check(falseAlarm !== undefined && falseAlarm.target === 5 && falseAlarm.actual === 3.2, () => "false alarms target ≤5% / actual 3.2%");
const series = pilot?.kpiSeries ?? [];
check(series.length === 6, () => `kpiSeries has 6 months (got ${series.length})`);
check(new Set(series.map((p) => p.month)).size === series.length, () => "kpiSeries months unique");
check(
  series[series.length - 1]?.actual === 7,
  () => `kpiSeries ends at the 7h actual (got ${series[series.length - 1]?.actual})`
);

console.log("\n== Store surface ==");
const actions = useDemoStore.getState();
check(typeof actions.approveProposal === "function", () => "approveProposal action present");
check(typeof actions.submitEvidence === "function", () => "submitEvidence action present");
check(typeof actions.approveMilestone === "function", () => "approveMilestone action present");
check(typeof actions.decideScale === "function", () => "decideScale action present");
check(typeof actions.setCompliance === "function", () => "setCompliance action present");
check(typeof actions.resetDemo === "function", () => "resetDemo action present");
check(Array.isArray(seed.auditLog) && seed.auditLog.length > 0, () => "audit log non-empty");
check(Array.isArray(seed.notifications) && seed.notifications.length > 0, () => "notifications non-empty");

console.log("\n== Consistency across surfaces ==");
check(new Set(proposals.map((p) => p.id)).size === proposals.length, () => "proposal ids unique");
check(new Set(startups.map((s) => s.id)).size === startups.length, () => "startup ids unique");
check(templates.length >= 7, () => `template library has 7+ templates (got ${templates.length})`);
check(startups.length >= 10, () => `directory has 10+ startups (got ${startups.length})`);
check(proposals.length >= 9, () => `9+ proposals across challenges (got ${proposals.length})`);

console.log("");
if (failures > 0) {
  console.error(`check:data FAILED — ${failures} problem${failures === 1 ? "" : "s"} found\n`);
  process.exit(1);
} else {
  console.log("check:data passed — seed story and copy are consistent\n");
}

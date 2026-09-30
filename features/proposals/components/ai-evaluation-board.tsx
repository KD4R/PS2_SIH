"use client";

import { useEffect, useRef, useState } from "react";
import { FileDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExecutiveCard } from "@/components/shared/executive-card";
import { BoardroomRadarChart } from "@/components/shared/radar-chart";
import { useToast } from "@/lib/demo/toast";
import { downloadEvaluationPdf } from "@/lib/demo/pdf";
import type { Evaluation, Proposal } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

const PERSONAS = [
  { role: "Procurement Officer", trait: "Process-precise" },
  { role: "Legal Advisor", trait: "Clause-by-clause" },
  { role: "Technical Assessor", trait: "Architecture-first" },
  { role: "Finance Analyst", trait: "Value-for-money" },
  { role: "Cyber & Risk Reviewer", trait: "Zero-trust" },
] as const;

const CRITERIA = ["Technical", "Innovation", "Dept fit", "Budget", "Scalability"];

/** Scripted per-proposal board output; falls back to the TechNova script. */
function scriptFor(proposal: Proposal): { notes: { agent: string; note: string }[]; scores: { criterion: string; score: number; weight: number }[]; total: number } {
  if (proposal.evaluation && proposal.evaluation.agentNotes.length >= 5) {
    return { notes: proposal.evaluation.agentNotes, scores: proposal.evaluation.scores, total: proposal.evaluation.total };
  }
  return {
    notes: [
      { agent: "Procurement Officer", note: "Summary maps cleanly to the outcome statement. Startup relaxations correctly claimed under the sandbox route." },
      { agent: "Legal Advisor", note: "Draft IP clause accepted: startup retains IP, department receives a perpetual non-exclusive licence." },
      { agent: "Technical Assessor", note: "Architecture is proven for this topology; sampling cadence meets the outcome target with margin." },
      { agent: "Finance Analyst", note: "Cost sits proportionately inside the published window; milestone spread protects the department." },
      { agent: "Cyber & Risk Reviewer", note: "In-country hosting confirmed. Recommend sandbox cap and an active kill switch for the pilot duration." },
    ],
    scores: [
      { criterion: "Technical Feasibility", score: 82, weight: 30 },
      { criterion: "Innovation & IP", score: 74, weight: 15 },
      { criterion: "Departmental Fit", score: 86, weight: 25 },
      { criterion: "Budget Reasonableness", score: 78, weight: 15 },
      { criterion: "Scalability", score: 80, weight: 15 },
    ],
    total: 81,
  };
}

interface Phase {
  kind: "typing" | "score" | "radar" | "verdict";
  agentIndex?: number;
}

/**
 * F16 scripted AI evaluation board. Five personas type 2–3 line notes with a
 * typing indicator (~1s each), then the score ring animates to the total, a
 * radar chart renders the criteria and a verdict banner resolves. Zero
 * network calls; everything derives from the proposal's seed evaluation.
 */
export function AiEvaluationBoard({
  proposal,
  startupName = "Startup",
  challengeTitle = "Challenge",
  onStored,
}: {
  proposal: Proposal;
  startupName?: string;
  challengeTitle?: string;
  onStored?: () => void;
}) {
  const { toast } = useToast();
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [done, setDone] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const script = scriptFor(proposal);

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const run = () => {
    setStarted(true);
    setDone(false);
    const t: ReturnType<typeof setTimeout>[] = [];
    script.notes.forEach((_, i) => {
      t.push(setTimeout(() => setPhase({ kind: "typing", agentIndex: i }), 400 + i * 1100));
    });
    const afterNotes = 400 + script.notes.length * 1100;
    t.push(setTimeout(() => setPhase({ kind: "score" }), afterNotes));
    t.push(setTimeout(() => setPhase({ kind: "radar" }), afterNotes + 900));
    t.push(setTimeout(() => setPhase({ kind: "verdict" }), afterNotes + 1500));
    t.push(
      setTimeout(() => {
        setDone(true);
        onStored?.();
      }, afterNotes + 2100),
    );
    timers.current = t;
  };

  const evaluation: Evaluation = {
    scores: script.scores,
    total: script.total,
    verdict: script.total >= 75 ? "Recommend" : script.total >= 55 ? "Conditional" : "Not Recommended",
    agentNotes: script.notes,
  };

  const radarData = script.scores.map((s, i) => ({ dimension: CRITERIA[i] ?? s.criterion, score: s.score }));
  const revealedCount = phase?.kind === "typing" ? (phase.agentIndex ?? -1) + 1 : done || phase ? script.notes.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">AI Evaluation Board</h3>
          <p className="text-sm text-muted-foreground">Five reviewers assess the proposal against published criteria.</p>
        </div>
        {!started ? (
          <Button onClick={run} className="bg-violet-600 hover:bg-violet-700 text-white">
            <Sparkles className="h-4 w-4" /> Run AI evaluation
          </Button>
        ) : done ? (
          <Button
            variant="outline"
            onClick={() => downloadEvaluationPdf(evaluation, { startupName, challengeTitle })}
          >
            <FileDown className="h-4 w-4" /> Download report
          </Button>
        ) : (
          <Badge tone="signal" pulse>
            Board in session…
          </Badge>
        )}
      </div>

      {started && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PERSONAS.map((p, i) => {
            const typing = phase?.kind === "typing" && phase.agentIndex === i;
            const revealed = i < revealedCount;
            return (
              <div key={p.role} className="space-y-2">
                <ExecutiveCard name={p.role} role={p.role} trait={p.trait} presence={typing ? "speaking" : revealed ? "active" : "idle"} />
                <div className="min-h-16 rounded-lg border border-border bg-muted/30 p-2.5 text-xs leading-snug text-muted-foreground">
                  {typing ? (
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                    </span>
                  ) : revealed ? (
                    script.notes[i]?.note
                  ) : (
                    <span className="opacity-40">Awaiting turn…</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {phase && (phase.kind === "score" || phase.kind === "radar" || phase.kind === "verdict" || done) && (
        <div className={cn("grid grid-cols-1 items-center gap-6 rounded-xl border border-border bg-card p-6 lg:grid-cols-[220px_1fr]", done && "animate-in fade-in")}>
          <div className="flex flex-col items-center gap-2">
            <AnimatedRing score={script.total} animate={phase.kind === "score" || done} />
            <p className="text-sm font-medium">Weighted total</p>
          </div>
          {(phase.kind === "radar" || phase.kind === "verdict" || done) && (
            <BoardroomRadarChart
              title="Criterion profile"
              series={[{ key: "score", label: "Score" }]}
              data={radarData}
              height={260}
            />
          )}
        </div>
      )}

      {done && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-sm font-bold text-green-800">Verdict: Recommend for pilot</p>
          <p className="mt-1 text-xs text-green-700">
            Weighted score {script.total}/100. The board recommends taking this proposal to a milestone-based pilot agreement.
          </p>
        </div>
      )}
    </div>
  );
}

function AnimatedRing({ score, animate }: { score: number; animate: boolean }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 800);
      setShown(Math.round(score * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, score]);

  const color = shown >= 75 ? "#16a34a" : shown >= 50 ? "#d97706" : "#dc2626";
  const r = 34;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24">
      <svg className="-rotate-90" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" strokeWidth="7" className="stroke-muted" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          strokeWidth="7"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - shown / 100)}
          style={{ transition: "stroke-dashoffset 120ms linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">{shown}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

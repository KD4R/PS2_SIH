"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, ChevronUp, TrendingUp, AlertTriangle, XCircle } from "lucide-react";

interface DimensionalScores {
  technicalFeasibility: number;
  gfrCompliance: number;
  citizenImpact: number;
  costEffectiveness: number;
  scalability: number;
}

interface ProposalVerdict {
  scores: DimensionalScores;
  rationale: Record<string, string>;
  totalScore: number;
  verdict: "STRONGLY_RECOMMENDED" | "RECOMMENDED" | "REVIEW_NEEDED" | "NOT_RECOMMENDED" | "AUTO_REJECTED";
  autoRejected: boolean;
  autoRejectionReasons: string[];
  headline: string;
  strengths: string[];
  risks: string[];
  recommendation: string;
}

const DIMENSIONS = [
  { key: "technicalFeasibility", label: "Technical" },
  { key: "gfrCompliance",        label: "GFR 2017" },
  { key: "citizenImpact",        label: "Citizen Impact" },
  { key: "costEffectiveness",    label: "Cost-Eff." },
  { key: "scalability",          label: "Scalability" },
] as const;

const AUTO_REJECT_DIMENSION = 8;

const VERDICT_CONFIG = {
  STRONGLY_RECOMMENDED: { color: "bg-emerald-500/15 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Strongly Recommended" },
  RECOMMENDED:          { color: "bg-green-500/15 text-green-700 border-green-200",       dot: "bg-green-500",   label: "Recommended" },
  REVIEW_NEEDED:        { color: "bg-amber-500/15 text-amber-700 border-amber-200",       dot: "bg-amber-500",   label: "Review Needed" },
  NOT_RECOMMENDED:      { color: "bg-orange-500/15 text-orange-700 border-orange-200",    dot: "bg-orange-500",  label: "Not Recommended" },
  AUTO_REJECTED:        { color: "bg-red-500/15 text-red-700 border-red-200",             dot: "bg-red-500",     label: "Auto-Rejected" },
};

function ScoreRing({ score, max = 100 }: { score: number; max?: number }) {
  const pct = score / max;
  const color = pct >= 0.75 ? "#10b981" : pct >= 0.5 ? "#f59e0b" : "#ef4444";
  const r = 20, circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/20" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div className="text-center">
        <span className="text-base font-bold leading-none" style={{ color }}>{score}</span>
        <span className="text-[0.55rem] text-muted-foreground block leading-none">/100</span>
      </div>
    </div>
  );
}

function DimensionBar({ label, score, rationale }: { label: string; score: number; rationale?: string }) {
  const pct = (score / 20) * 100;
  const isFailing = score < AUTO_REJECT_DIMENSION;
  const barColor = isFailing ? "bg-red-500" : score >= 15 ? "bg-emerald-500" : score >= 10 ? "bg-amber-500" : "bg-orange-500";

  return (
    <div className="space-y-0.5" title={rationale}>
      <div className="flex items-center justify-between">
        <span className={`text-[0.6rem] font-medium ${isFailing ? "text-red-600" : "text-foreground"}`}>
          {isFailing && "⚠ "}{label}
        </span>
        <span className={`text-[0.6rem] font-bold tabular-nums ${isFailing ? "text-red-600" : "text-foreground"}`}>
          {score}/20
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {rationale && (
        <p className="text-[0.55rem] text-muted-foreground leading-tight">{rationale}</p>
      )}
    </div>
  );
}

export function VerdictCard({ proposalId, onEvaluated }: { proposalId: string; onEvaluated?: () => void }) {
  const [verdict, setVerdict] = useState<ProposalVerdict | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const runVerdict = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/verdict`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate verdict");
      setVerdict(data.verdict);
      onEvaluated?.();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!verdict) {
    return (
      <div className="space-y-1">
        <Button
          size="sm"
          className="w-full text-xs gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
          onClick={runVerdict}
          disabled={loading}
        >
          <Sparkles className="h-3 w-3" />
          {loading ? "Analysing…" : "Get AI Verdict"}
        </Button>
        {loading && (
          <p className="text-[0.6rem] text-muted-foreground text-center animate-pulse">
            Scoring 5 dimensions…
          </p>
        )}
        {error && <p className="text-xs text-destructive px-1">{error}</p>}
      </div>
    );
  }

  const cfg = VERDICT_CONFIG[verdict.verdict];

  return (
    <div className="rounded-lg border bg-card overflow-hidden text-xs">
      {/* Header: score ring + verdict badge */}
      <div className="flex items-center gap-2 p-2">
        <ScoreRing score={verdict.totalScore} />
        <div className="flex-1 min-w-0">
          <span className={`inline-flex items-center gap-1 text-[0.6rem] font-semibold px-1.5 py-0.5 rounded-full border ${cfg.color} mb-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
          <p className="text-[0.65rem] leading-tight text-muted-foreground line-clamp-2" title={verdict.headline}>
            {verdict.headline}
          </p>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="text-muted-foreground hover:text-foreground shrink-0 p-1">
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Auto-rejection banner */}
      {verdict.autoRejected && (
        <div className="mx-2 mb-2 rounded-md bg-red-50 border border-red-200 p-2">
          <p className="text-[0.6rem] font-semibold text-red-700 flex items-center gap-1 mb-1">
            <XCircle className="h-3 w-3" /> Auto-Rejected — Failed Minimum Thresholds
          </p>
          <ul className="space-y-0.5">
            {verdict.autoRejectionReasons.map((r, i) => (
              <li key={i} className="text-[0.6rem] text-red-600 flex gap-1">
                <span className="shrink-0">•</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Dimension breakdown */}
      {expanded && (
        <div className="border-t px-3 py-2 space-y-3 bg-muted/20">
          {/* 5 dimension bars */}
          <div className="space-y-2">
            {DIMENSIONS.map(({ key, label }) => (
              <DimensionBar
                key={key}
                label={label}
                score={verdict.scores[key]}
                rationale={verdict.rationale?.[key]}
              />
            ))}
          </div>

          <div className="border-t pt-2 space-y-2">
            <div>
              <p className="text-[0.6rem] font-semibold text-emerald-600 flex items-center gap-1 mb-1">
                <TrendingUp className="h-3 w-3" /> Strengths
              </p>
              <ul className="space-y-0.5">
                {verdict.strengths.map((s, i) => (
                  <li key={i} className="text-[0.6rem] text-muted-foreground flex gap-1">
                    <span className="text-emerald-500 shrink-0">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[0.6rem] font-semibold text-destructive flex items-center gap-1 mb-1">
                <AlertTriangle className="h-3 w-3" /> Risks
              </p>
              <ul className="space-y-0.5">
                {verdict.risks.map((r, i) => (
                  <li key={i} className="text-[0.6rem] text-muted-foreground flex gap-1">
                    <span className="text-destructive shrink-0">!</span>{r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t pt-1.5">
              <p className="text-[0.6rem] text-foreground leading-relaxed">{verdict.recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

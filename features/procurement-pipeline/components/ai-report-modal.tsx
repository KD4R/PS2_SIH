"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, X, TrendingUp, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";

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
  { key: "technicalFeasibility", label: "Technical Feasibility", icon: "⚙️" },
  { key: "gfrCompliance",        label: "GFR 2017 Compliance",   icon: "📋" },
  { key: "citizenImpact",        label: "Citizen Impact",        icon: "👥" },
  { key: "costEffectiveness",    label: "Cost-Effectiveness",    icon: "💰" },
  { key: "scalability",          label: "Scalability",           icon: "📈" },
] as const;

const AUTO_REJECT_DIMENSION = 8;

const VERDICT_CONFIG = {
  STRONGLY_RECOMMENDED: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-800", label: "Strongly Recommended", icon: "🟢" },
  RECOMMENDED:          { bg: "bg-green-50",   border: "border-green-300",   text: "text-green-800",   label: "Recommended",          icon: "🟢" },
  REVIEW_NEEDED:        { bg: "bg-amber-50",   border: "border-amber-300",   text: "text-amber-800",   label: "Review Needed",         icon: "🟡" },
  NOT_RECOMMENDED:      { bg: "bg-orange-50",  border: "border-orange-300",  text: "text-orange-800",  label: "Not Recommended",       icon: "🟠" },
  AUTO_REJECTED:        { bg: "bg-red-50",     border: "border-red-300",     text: "text-red-800",     label: "Auto-Rejected",         icon: "🔴" },
};

function ScoreBar({ score, failing }: { score: number; failing: boolean }) {
  const pct = (score / 20) * 100;
  const color = failing ? "bg-red-500" : score >= 15 ? "bg-emerald-500" : score >= 10 ? "bg-amber-500" : "bg-orange-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold tabular-nums w-10 text-right ${failing ? "text-red-600" : "text-foreground"}`}>
        {score}/20
      </span>
    </div>
  );
}

export function AiReportModal({
  proposalId,
  proposalText,
  startupName,
  onApprove,
  onReject,
}: {
  proposalId: string;
  proposalText?: string;
  startupName: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [verdict, setVerdict] = useState<ProposalVerdict | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (verdict) { setOpen(true); return; }
    setLoading(true);
    setOpen(true);
    try {
      // First try to load stored verdict
      const res = await fetch(`/api/proposals/${proposalId}/verdict`);
      const data = await res.json();
      if (data.verdict) {
        setVerdict(data.verdict);
      }
      // If null, we'll show the re-analyse button (verdict stays null)
    } finally {
      setLoading(false);
    }
  };

  const reAnalyse = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/verdict`, { method: "POST" });
      const data = await res.json();
      if (data.verdict) setVerdict(data.verdict);
    } finally {
      setLoading(false);
    }
  };

  const cfg = verdict ? VERDICT_CONFIG[verdict.verdict] : null;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="w-full text-xs gap-1.5 border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
        onClick={fetchReport}
      >
        <FileText className="h-3 w-3" />
        View AI Report
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
              <div>
                <h2 className="text-base font-semibold">AI Evaluation Report</h2>
                <p className="text-xs text-muted-foreground">{startupName}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground rounded-full p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="h-8 w-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                  <p className="text-sm text-muted-foreground animate-pulse">Loading AI report…</p>
                </div>
              )}

              {!loading && !verdict && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="text-4xl">📄</div>
                  <p className="text-sm text-muted-foreground text-center">
                    No stored report found.<br />
                    <span className="text-xs">This proposal was evaluated before detailed reports were enabled.</span>
                  </p>
                  <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white" onClick={reAnalyse}>
                    Re-analyse with AI
                  </Button>
                </div>
              )}

              {verdict && cfg && (
                <>
                  {/* Verdict banner */}
                  <div className={`rounded-xl border-2 ${cfg.bg} ${cfg.border} p-4 flex items-center gap-4`}>
                    <div className="text-center shrink-0">
                      <div className={`text-3xl font-black ${cfg.text}`}>{verdict.totalScore}</div>
                      <div className="text-xs text-muted-foreground">/ 100</div>
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${cfg.text}`}>{cfg.icon} {cfg.label}</div>
                      <p className="text-sm text-muted-foreground mt-0.5">{verdict.headline}</p>
                    </div>
                  </div>

                  {/* Auto-rejection alert */}
                  {verdict.autoRejected && (
                    <div className="rounded-xl border border-red-300 bg-red-50 p-4">
                      <p className="text-sm font-semibold text-red-700 flex items-center gap-1.5 mb-2">
                        <XCircle className="h-4 w-4" /> Auto-Rejected — Failed Minimum Thresholds
                      </p>
                      <ul className="space-y-1">
                        {verdict.autoRejectionReasons.map((r, i) => (
                          <li key={i} className="text-sm text-red-600 flex gap-2">
                            <span>•</span>{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Dimensional scores */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Dimensional Scorecard</h3>
                    {DIMENSIONS.map(({ key, label, icon }) => {
                      const score = verdict.scores[key];
                      const failing = score < AUTO_REJECT_DIMENSION;
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${failing ? "text-red-600" : ""}`}>
                              {icon} {failing && "⚠ "}{label}
                            </span>
                          </div>
                          <ScoreBar score={score} failing={failing} />
                          {verdict.rationale?.[key] && (
                            <p className="text-xs text-muted-foreground pl-1">{verdict.rationale[key]}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Strengths */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5 text-emerald-700">
                      <TrendingUp className="h-4 w-4" /> Strengths
                    </h3>
                    <ul className="space-y-1.5">
                      {verdict.strengths.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risks */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5 text-destructive">
                      <AlertTriangle className="h-4 w-4" /> Risks & Gaps
                    </h3>
                    <ul className="space-y-1.5">
                      {verdict.risks.map((r, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />{r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Final recommendation */}
                  <div className="rounded-xl bg-muted/50 border p-4">
                    <h3 className="text-sm font-semibold mb-2">AI Recommendation</h3>
                    <p className="text-sm text-foreground leading-relaxed">{verdict.recommendation}</p>
                  </div>
                </>
              )}
            </div>

            {/* Footer actions */}
            <div className="border-t px-6 py-4 flex gap-3 bg-muted/20">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200"
                onClick={() => { setOpen(false); onApprove(); }}
              >
                ✓ Approve Pilot
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-destructive hover:bg-destructive/10 border-destructive/20"
                onClick={() => { setOpen(false); onReject(); }}
              >
                ✕ Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

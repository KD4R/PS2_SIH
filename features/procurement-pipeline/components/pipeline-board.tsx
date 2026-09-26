"use client";

import React, { useEffect, useState } from "react";
import { fetchPipelineForChallenge, triggerAiEvaluation, approveProposal } from "../service";
import type { PipelineProposal } from "../types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MilestoneDialog } from "./milestone-dialog";
import { RejectDialog } from "./reject-dialog";
import { ContractGenerator } from "./contract-generator";
import { submitForValidation, recordProcurementDecision } from "../service";
import { VerdictCard } from "./verdict-card";
import { AiReportModal } from "./ai-report-modal";
import { KillSwitchDialog } from "./kill-switch-dialog";

const COLUMNS = ["submitted", "evaluating", "evaluated", "pilot_active", "validation", "decided", "rejected"];

export function PipelineBoard({ challengeId }: { challengeId: string }) {
  const [proposals, setProposals] = useState<PipelineProposal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [killSwitchTarget, setKillSwitchTarget] = useState<string | null>(null);
  const [killSwitchToast, setKillSwitchToast] = useState(false);
  const [whatsappToast, setWhatsappToast] = useState(false);

  const load = () => {
    setLoading(true);
    fetchPipelineForChallenge(challengeId)
      .then((data: any) => setProposals(data.proposals || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [challengeId]);

  const handleEvaluate = async (id: string) => {
    if (!confirm("Run HackAgent AI evaluation on this proposal?")) return;
    await triggerAiEvaluation(id);
    load();
  };

  const handleApprove = async (milestones: any[]) => {
    if (!approving) return;
    await approveProposal(approving, milestones);
    setApproving(null);
    setWhatsappToast(true);
    setTimeout(() => setWhatsappToast(false), 5000);
    load();
  };

  const handleReject = async (reason: string) => {
    if (!rejecting) return;
    // Note: reject logic should go to API. For now, assume reject API exists and is wired in service
    await fetch(`/api/proposals/${rejecting}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    });
    setRejecting(null);
    load();
  };

  const handleSubmitForValidation = async (id: string) => {
    if (!confirm("Submit this pilot for independent validation?")) return;
    await submitForValidation(id);
    load();
  };

  const handleRecordDecision = async (id: string) => {
    const decision = prompt("Enter decision (scale, procure, replicate, stop, improve, extend_pilot):", "scale");
    if (!decision) return;
    const notes = prompt("Enter decision notes:");
    if (!notes) return;
    
    await recordProcurementDecision(id, decision, notes, []);
    load();
  };

  if (loading) return <div className="p-8 text-center">Loading Pipeline...</div>;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-12rem)]">
        {COLUMNS.map(col => (
          <div key={col} className="w-80 flex-shrink-0 bg-muted/50 rounded-xl p-4 flex flex-col">
            <h3 className="font-semibold uppercase tracking-wider text-xs mb-4 text-muted-foreground">
              {col.replace("_", " ")}
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {proposals.filter(p => p.status === col).map(p => (
                <Card key={p.id} className="cursor-default shadow-sm border-muted-foreground/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{(p as any).startupName || `Startup ${p.startupId.substring(0,8)}`}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground pb-2">
                    Submitted: {new Date(p.submittedAt).toLocaleDateString()}
                    {p.status === 'evaluating' && p.meetingId && (
                      <div className="mt-2 text-blue-600 animate-pulse font-medium">
                        AI Boardroom Active
                      </div>
                    )}
                    {p.aiMatchScore !== undefined && p.aiMatchScore !== null && (
                      <div className="mt-2 font-bold text-primary">
                        AI Score: {p.aiMatchScore}/100
                      </div>
                    )}
                  </CardContent>
                  {/* SUBMITTED: Officer just clicks Get AI Verdict — instant score, no boardroom wait */}
                  {col === "submitted" && (
                    <CardFooter className="pt-0 flex flex-col gap-2">
                      <VerdictCard proposalId={p.id} onEvaluated={load} />
                    </CardFooter>
                  )}
                  {/* EVALUATING: Boardroom was triggered (demo / old flow) */}
                  {col === "evaluating" && (
                    <CardFooter className="pt-0 flex flex-col gap-2">
                      <Button size="sm" variant="outline" className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white border-blue-600" onClick={() => window.open(`/boardroom?meeting=${p.meetingId}`, '_blank')}>
                        View AI Boardroom
                      </Button>
                      <VerdictCard proposalId={p.id} onEvaluated={load} />
                    </CardFooter>
                  )}
                  {/* EVALUATED: Show AI report button + approve/reject */}
                  {col === "evaluated" && (
                    <CardFooter className="pt-0 flex flex-col gap-2">
                      <AiReportModal
                        proposalId={p.id}
                        startupName={(p as any).startupName || `Startup ${p.startupId.substring(0, 8)}`}
                        onApprove={() => setApproving(p.id)}
                        onReject={() => setRejecting(p.id)}
                      />
                    </CardFooter>
                  )}
                  {col === "pilot_active" && (
                    <CardFooter className="pt-0 flex flex-col gap-2">
                      <ContractGenerator startupName={(p as any).startupName || `Startup ${p.startupId.substring(0,8)}`} />
                      <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => handleSubmitForValidation(p.id)}>Submit for Validation</Button>
                      {/* 🛑 Financial Kill Switch — Task 3 from PRD */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs bg-red-600 hover:bg-red-700 text-white border-red-600 font-bold gap-1.5"
                        onClick={() => setKillSwitchTarget(p.id)}
                      >
                        🛑 HALT PILOT (Kill Switch)
                      </Button>
                    </CardFooter>
                  )}

                  {col === "validation" && (
                    <CardFooter className="pt-0 flex flex-col gap-2">
                      <Button size="sm" variant="outline" className="w-full text-xs bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 border-purple-200" onClick={() => handleRecordDecision(p.id)}>Record Decision</Button>
                    </CardFooter>
                  )}
                  {col === "decided" && (
                    <CardFooter className="pt-0 flex flex-col gap-2">
                      <span className="text-xs font-semibold text-green-600 bg-green-50 p-1 rounded border border-green-200 text-center">Procurement Decision Recorded</span>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {approving && <MilestoneDialog onClose={() => setApproving(null)} onSubmit={handleApprove} />}
      {rejecting && <RejectDialog onClose={() => setRejecting(null)} onSubmit={handleReject} />}

      {/* 🛑 Kill Switch Dialog — Task 3 from PRD */}
      {killSwitchTarget && (
        <KillSwitchDialog
          onClose={() => setKillSwitchTarget(null)}
          onSubmit={async (reason: string) => {
            try {
              const res = await fetch(`/api/proposals/${killSwitchTarget}/kill-switch`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
              });
              if (res.ok) {
                setKillSwitchTarget(null);
                setKillSwitchToast(true);
                setTimeout(() => setKillSwitchToast(false), 4000);
                load();
              } else {
                alert("Kill switch failed. Check permissions.");
              }
            } catch (e) {
              console.error(e);
              alert("Network error.");
            }
          }}
        />
      )}

      {/* Kill Switch Toast */}
      {killSwitchToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl shadow-red-500/30 animate-fade-up flex items-center gap-3 border border-red-500">
          <span className="text-xl">🛑</span>
          <div>
            <p className="font-bold text-sm">Pilot Halted</p>
            <p className="text-xs text-red-100">Funds Frozen. Legal Notice Generated.</p>
          </div>
        </div>
      )}

      {/* WhatsApp Mock Toast - Task 5 from PRD */}
      {whatsappToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white px-4 py-3 rounded-2xl shadow-xl animate-fade-up flex items-start gap-3 w-80">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <span className="text-xl">🏢</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-sm">Govt of Maharashtra</p>
              <span className="text-xs opacity-75 whitespace-nowrap ml-auto">Just now</span>
            </div>
            <p className="text-sm leading-tight">Your pilot is approved! The contract and milestones have been set.</p>
          </div>
        </div>
      )}
    </>
  );
}

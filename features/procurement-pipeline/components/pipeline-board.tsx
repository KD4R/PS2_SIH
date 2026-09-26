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

const COLUMNS = ["submitted", "evaluating", "evaluated", "pilot_active", "validation", "decided", "rejected"];

export function PipelineBoard({ challengeId }: { challengeId: string }) {
  const [proposals, setProposals] = useState<PipelineProposal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

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
    </>
  );
}

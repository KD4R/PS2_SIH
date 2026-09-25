"use client";

import React, { useEffect, useState } from "react";
import { fetchPipelineForChallenge, triggerAiEvaluation, approveProposal } from "../service";
import type { PipelineProposal } from "../types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MilestoneDialog } from "./milestone-dialog";
import { RejectDialog } from "./reject-dialog";

const COLUMNS = ["submitted", "evaluating", "evaluated", "approved", "pilot_active", "completed"];

export function PipelineBoard({ challengeId }: { challengeId: string }) {
  const [proposals, setProposals] = useState<PipelineProposal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchPipelineForChallenge(challengeId)
      .then(data => setProposals(data.proposals || []))
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
    await approveProposal(approving, { milestones });
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
                    {p.aiMatchScore !== undefined && p.aiMatchScore !== null && (
                      <div className="mt-2 font-bold text-primary">
                        AI Score: {p.aiMatchScore}/100
                      </div>
                    )}
                  </CardContent>
                  {col === "submitted" && (
                    <CardFooter className="pt-0">
                      <Button size="sm" className="w-full text-xs" onClick={() => handleEvaluate(p.id)}>Run AI Evaluation</Button>
                    </CardFooter>
                  )}
                  {col === "evaluated" && (
                    <CardFooter className="pt-0 flex flex-col gap-2">
                      <Button size="sm" variant="outline" className="w-full text-xs bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200" onClick={() => setApproving(p.id)}>Approve Pilot</Button>
                      <Button size="sm" variant="outline" className="w-full text-xs text-destructive hover:bg-destructive/10 border-destructive/20" onClick={() => setRejecting(p.id)}>Reject</Button>
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

"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchMyProposals } from '@/features/pilot-dashboard/service';
import type { ProposalDetailResponse } from '@/types/api';

export default function MyProposalsPage() {
  const [proposals, setProposals] = useState<ProposalDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProposals()
      .then(data => setProposals(data.proposals || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Proposals...</div>;

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Proposals</h1>
        <p className="text-muted-foreground mt-2">
          Track the status of your submissions, view AI evaluation reports, and manage your active pilots.
        </p>
      </div>

      {!proposals.length ? (
        <div className="text-center p-12 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground mb-4">You haven't submitted any proposals yet.</p>
          <Link href="/marketplace" className="text-primary hover:underline font-medium">
            Browse the Challenge Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {proposals.map(p => (
            <Card key={p.id} className="flex flex-col">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                    Submitted: {new Date(p.submittedAt).toLocaleDateString()}
                  </p>
                  <CardTitle className="text-xl">{(p as any).challengeTitle || "Challenge Proposal"}</CardTitle>
                </div>
                <Badge className={
                  p.status === "approved" || p.status === "pilot_active" ? "bg-green-500 text-white" :
                  p.status === "rejected" ? "bg-destructive text-white" :
                  p.status === "evaluating" ? "bg-amber-500 text-white" :
                  p.status === "evaluated" ? "bg-blue-500 text-white" :
                  "bg-secondary text-secondary-foreground"
                }>
                  {p.status.replace("_", " ").toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {p.proposalText}
                </p>
                {p.aiMatchScore !== undefined && p.aiMatchScore !== null && (
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="text-sm font-medium">AI Match Score</span>
                    <span className="text-lg font-bold text-primary">{p.aiMatchScore}/100</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 pb-4">
                <Link href={`/my-proposals/${p.id}`} className="w-full text-center text-sm font-medium text-primary hover:underline">
                  Track Pilot & Milestones →
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

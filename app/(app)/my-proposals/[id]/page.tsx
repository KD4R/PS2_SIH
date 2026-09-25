"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchProposalDetails, fetchMilestones } from '@/features/pilot-dashboard/service';
import { MilestoneTracker } from '@/features/pilot-dashboard/components/milestone-tracker';
import type { ProposalDetailResponse, MilestoneDetail } from '@/types/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ProposalMilestonesPage({ params }: { params: { id: string } }) {
  const [proposal, setProposal] = useState<ProposalDetailResponse | null>(null);
  const [milestones, setMilestones] = useState<MilestoneDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [propData, msData] = await Promise.all([
        fetchProposalDetails(params.id),
        fetchMilestones(params.id)
      ]);
      setProposal(propData.proposal);
      setMilestones(msData.milestones || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load proposal data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [params.id]);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading tracker...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!proposal) return null;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/my-proposals" className="text-sm text-muted-foreground hover:underline mb-4 inline-block">
          ← Back to My Proposals
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Pilot Tracker</h1>
            <p className="text-muted-foreground mt-2">
              Applying for: {(proposal as any).challengeTitle}
            </p>
          </div>
          <Badge className="text-base px-3 py-1 uppercase">{proposal.status.replace("_", " ")}</Badge>
        </div>
      </div>

      {proposal.reportId && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between mb-8">
          <div>
            <h4 className="font-semibold text-primary">AI Evaluation Report Available</h4>
            <p className="text-sm text-muted-foreground">The AI panel has evaluated your proposal.</p>
          </div>
          <Link href={`/reports/${proposal.reportId}`}>
            <Button variant="outline">View Full Report</Button>
          </Link>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Milestones & Payments</h3>
        {(proposal.status === "approved" || proposal.status === "pilot_active") && milestones.length === 0 ? (
          <p className="text-muted-foreground">The department is currently defining milestones for this pilot.</p>
        ) : proposal.status === "submitted" || proposal.status === "evaluating" ? (
          <p className="text-muted-foreground">Milestones will be available once the pilot is approved.</p>
        ) : (
          <MilestoneTracker 
            milestones={milestones} 
            role="startup_founder" 
            onUploadEvidence={async (id, text) => {
              await fetch(`/api/milestones/${id}/evidence`, { method: "POST", body: JSON.stringify({ text }) });
              loadData();
            }}
            onReviewEvidence={() => {}}
          />
        )}
      </div>

      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold mb-2">Your Proposal Text</h3>
        <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap font-mono">
          {proposal.proposalText}
        </div>
      </div>
    </div>
  );
}

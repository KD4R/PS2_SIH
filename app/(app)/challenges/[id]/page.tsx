"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProposalDialog } from '@/features/challenge-marketplace/components/proposal-dialog';
import type { ChallengeDetailResponse } from '@/types/api';
// Normally we'd fetch profile from context to check role, here mocking for demo

export default function ChallengeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [role, setRole] = useState("startup_founder");

  useEffect(() => {
    if (document.cookie.includes("demo_role=department_officer")) {
      setRole("department_officer");
    }
  }, []);

  
  const [challenge, setChallenge] = useState<ChallengeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetch(`/api/challenges/${params.id}`)
      .then(res => res.json())
      .then(data => setChallenge(data.challenge))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading challenge details...</div>;
  if (!challenge) return <div className="p-8 text-center text-destructive">Challenge not found.</div>;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Link href="/marketplace" className="text-sm text-muted-foreground hover:underline mb-6 inline-block">
        ← Back to Marketplace
      </Link>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <Badge className="mb-2 bg-transparent text-foreground border uppercase tracking-wider">{challenge.domain}</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{challenge.title}</h1>
        </div>
        <Badge className={challenge.status === "open" ? "bg-green-500" : ""}>
          {challenge.status.toUpperCase()}
        </Badge>
      </div>

      <div className="bg-muted/50 rounded-xl p-6 mb-8 whitespace-pre-wrap font-mono text-sm border">
        {challenge.description}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-sm text-muted-foreground font-medium mb-1">Pilot Budget (Max)</p>
          <p className="text-xl font-bold">
            {challenge.budgetInr ? `₹${(challenge.budgetInr / 100000).toFixed(2)} Lakhs` : "Unspecified"}
          </p>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-sm text-muted-foreground font-medium mb-1">Submission Deadline</p>
          <p className="text-xl font-bold">
            {challenge.deadline ? new Date(challenge.deadline).toLocaleDateString() : "Rolling Basis"}
          </p>
        </div>
      </div>

      <div className="flex gap-4 border-t pt-6">
        {role === "department_officer" ? (
          <Link href={`/challenges/${challenge.id}/pipeline`}>
            <Button size="lg">View Proposals Pipeline</Button>
          </Link>
        ) : (
          <Button size="lg" onClick={() => setApplying(true)}>
            Apply with Proposal
          </Button>
        )}
      </div>

      {applying && (
        <ProposalDialog 
          challenge={challenge as any}
          onClose={() => setApplying(false)}
          onSubmitted={() => { setApplying(false); router.push("/my-proposals"); }}
        />
      )}
    </div>
  );
}

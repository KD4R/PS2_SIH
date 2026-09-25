"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChallengeCard } from "./challenge-card";
import { ProposalDialog } from "./proposal-dialog";
import { fetchOpenChallenges } from "../service";
import type { ChallengeCardData } from "../types";

export function ChallengeList() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<ChallengeCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyChallenge, setApplyChallenge] = useState<ChallengeCardData | null>(null);

  useEffect(() => {
    fetchOpenChallenges()
      .then(data => setChallenges(data.challenges || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse">Loading Project Marketplace...</div>;
  if (!challenges.length) return <div className="p-8 text-center text-muted-foreground">No active challenges available right now.</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map(c => (
          <ChallengeCard 
            key={c.id} 
            challenge={c} 
            onApply={() => setApplyChallenge(c)} 
          />
        ))}
      </div>
      
      {applyChallenge && (
        <ProposalDialog
          challenge={applyChallenge}
          onClose={() => setApplyChallenge(null)}
          onSubmitted={() => { 
            setApplyChallenge(null); 
            router.push("/my-proposals"); 
          }}
        />
      )}
    </>
  );
}

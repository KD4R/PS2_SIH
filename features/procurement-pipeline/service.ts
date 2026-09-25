export async function fetchPipelineForChallenge(challengeId: string) {
  const res = await fetch(`/api/challenges/${challengeId}/proposals`);
  if (!res.ok) throw new Error("Failed to load proposals");
  const data = await res.json();
  // Depending on how API returns it
  return { proposals: data.proposals || data };
}

export async function triggerAiEvaluation(proposalId: string) {
  const res = await fetch(`/api/proposals/${proposalId}/evaluate`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to evaluate");
  return res.json();
}

export async function approveProposal(proposalId: string, milestones: any[]) {
  const res = await fetch(`/api/proposals/${proposalId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ milestones })
  });
  if (!res.ok) throw new Error("Failed to approve");
  return res.json();
}

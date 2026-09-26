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
  if (!res.ok) {
    const text = await res.text();
    console.error("API Error in approveProposal:", text);
    throw new Error(`Failed to approve: ${text}`);
  }
  return res.json();
}

export async function submitForValidation(proposalId: string) {
  const res = await fetch(`/api/proposals/${proposalId}/validation`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to submit for validation");
  return res.json();
}

export async function recordProcurementDecision(proposalId: string, decision: string, notes: string, districts: string[]) {
  const res = await fetch(`/api/proposals/${proposalId}/decide`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, notes, districts })
  });
  if (!res.ok) throw new Error("Failed to record decision");
  return res.json();
}

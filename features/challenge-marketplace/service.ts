export async function submitProposal(challengeId: string, data: { proposalText: string }) {
  const res = await fetch(`/api/challenges/${challengeId}/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to submit proposal");
  }
  return res.json();
}

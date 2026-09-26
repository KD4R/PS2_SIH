import type { ProposalListResponse, ProposalDetailResponse, MilestoneListResponse } from "@/types/api";

export async function fetchMyProposals(): Promise<ProposalListResponse> {
  const res = await fetch("/api/proposals");
  if (!res.ok) throw new Error("Failed to load proposals");
  return res.json();
}

export async function fetchProposalDetails(id: string): Promise<{ proposal: ProposalDetailResponse }> {
  const res = await fetch(`/api/proposals/${id}`);
  if (!res.ok) throw new Error("Failed to load proposal details");
  return res.json();
}

export async function fetchMilestones(proposalId: string): Promise<MilestoneListResponse> {
  const res = await fetch(`/api/proposals/${proposalId}/milestones`);
  if (!res.ok) throw new Error("Failed to load milestones");
  return res.json();
}

export async function uploadMilestoneEvidence(milestoneId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch(`/api/milestones/${milestoneId}/evidence`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to upload evidence");
  }
  return res.json();
}

export interface PipelineProposal {
  id: string;
  startupId: string;
  startupName: string;
  status: string;
  aiMatchScore?: number;
  submittedAt: string;
  proposalText?: string;
}

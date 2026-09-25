export interface ChallengeCardData {
  id: string;
  title: string;
  domain: string;
  status: "open" | "closed" | "evaluating";
  description: string;
  budgetInr?: number;
  deadline?: string;
  createdAt: string;
}

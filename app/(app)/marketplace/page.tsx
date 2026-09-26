import { ChallengeList } from "@/features/challenge-marketplace/components/challenge-list";

export const metadata = { title: "Challenge Marketplace" };

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">GovProcure Marketplace</h1>
        <p className="mt-2 text-muted-foreground">Browse open government challenges and submit your proposals.</p>
      </div>
      <ChallengeList />
    </div>
  );
}

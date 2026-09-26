import { OfficerChallengeManager } from "@/features/challenge-marketplace/components/officer-challenge-manager";

export const metadata = { title: "My Challenges" };

export default function ChallengesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">My Challenges</h1>
        <p className="mt-2 text-muted-foreground">Manage the problem statements you've published.</p>
      </div>
      <OfficerChallengeManager />
    </div>
  );
}

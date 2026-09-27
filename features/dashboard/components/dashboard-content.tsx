"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ClipboardCheck, FileBarChart, Percent } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { ProposalPipeline } from "@/features/dashboard/components/startup/proposal-pipeline";
import { MilestoneTracker } from "@/features/dashboard/components/startup/milestone-tracker";
import { RecommendedChallenges } from "@/features/dashboard/components/startup/recommended-challenges";
import { ComplianceHealth } from "@/features/dashboard/components/startup/compliance-health";
import { ActiveChallenges } from "@/features/dashboard/components/officer/active-challenges";
import { ActionableInbox } from "@/features/dashboard/components/officer/actionable-inbox";
import { ActivePilots } from "@/features/dashboard/components/officer/active-pilots";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDashboard, type DashboardResponse } from "@/features/dashboard/service";

const metricIcons = [ClipboardCheck, FileBarChart, Percent, ArrowUpRight];

export function DashboardContent({ userName, role = "startup_founder" }: { userName: string, role?: string }) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-10">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState description={error ?? "Dashboard data is unavailable."} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow={role === "department_officer" ? "Department Overview" : "Startup Overview"}
        title={role === "department_officer" ? `Welcome, ${userName}` : `Good morning, ${userName}`}
        description={role === "department_officer" ? "Monitor open challenges and evaluate startup proposals in your pipeline." : "Browse open government challenges, manage your proposals, and prep your next pitch."}
        action={
          <Button asChild>
            {role === "department_officer" ? (
              <Link href="/challenges/new">Create Challenge</Link>
            ) : (
              <Link href="/marketplace">Browse Marketplace</Link>
            )}
          </Button>
        }
      />

      <QuickActions role={role} />

      {role === "department_officer" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ActiveChallenges />
          <ActionableInbox />
          <ActivePilots />
        </div>
      )}

      {role === "startup_founder" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ProposalPipeline />
          <MilestoneTracker />
          <RecommendedChallenges />
          <ComplianceHealth />
        </div>
      )}

    </div>
  );
}

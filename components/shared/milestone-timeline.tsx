"use client";

import { cn } from "@/lib/utils";

export type MilestoneStatus = "completed" | "in-progress" | "pending";

export interface Milestone {
  id: string;
  title: string;
  date?: string;
  amount?: string;
  status: MilestoneStatus;
  description?: string;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
  className?: string;
}

export function MilestoneTimeline({ milestones, className }: MilestoneTimelineProps) {
  return (
    <div className={cn("relative border-l-2 border-primary ml-3 space-y-6", className)}>
      {milestones.map((milestone, index) => (
        <div key={milestone.id} className="relative pl-6">
          {/* Node */}
          <div className={cn(
            "absolute -left-[9px] top-1 h-4 w-4 rounded-full transition-colors",
            milestone.status === "completed" ? "bg-primary ring-4 ring-primary/20" :
            milestone.status === "in-progress" ? "bg-amber-500 ring-4 ring-amber-500/20" :
            "bg-muted border-2 border-muted-foreground"
          )} />
          
          <h4 className={cn(
            "font-medium text-sm",
            milestone.status === "pending" && "text-muted-foreground"
          )}>
            {milestone.title}
          </h4>
          
          {(milestone.amount || milestone.date) && (
            <p className={cn(
              "text-xs font-medium mt-1",
              milestone.status === "completed" ? "text-green-600" :
              milestone.status === "in-progress" ? "text-amber-600" :
              "text-muted-foreground"
            )}>
              {milestone.amount && <span>{milestone.amount} </span>}
              {milestone.status === "completed" && "Paid "}
              {milestone.status === "in-progress" && "Invoice Raised "}
              {milestone.status === "pending" && "Expected "}
              {milestone.date && <span>({milestone.date})</span>}
            </p>
          )}

          {milestone.description && (
            <div className="text-xs text-muted-foreground mt-1">
              {milestone.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

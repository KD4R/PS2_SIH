"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MilestoneDetail } from "@/types/api";

export function MilestoneTracker({
  milestones,
  role,
  onUploadEvidence,
  onReviewEvidence
}: {
  milestones: MilestoneDetail[];
  role: string;
  onUploadEvidence: (id: string, text: string) => void;
  onReviewEvidence: (id: string, approved: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      {milestones.map(m => (
        <div key={m.id} className="border p-4 rounded-md bg-card">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">{m.title}</h3>
            <Badge className={m.status === "approved" ? "bg-green-500 hover:bg-green-600" : "bg-secondary text-secondary-foreground"}>
              {m.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{m.description}</p>
          <div className="text-sm font-bold mb-4">Payment: ₹{m.paymentInr.toLocaleString()}</div>
          
          {m.status === "pending" && role === "startup_founder" && (
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={() => onUploadEvidence(m.id, "Mock evidence")}>Upload Evidence (Mock)</Button>
            </div>
          )}
          
          {m.status === "in_review" && role === "department_officer" && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onReviewEvidence(m.id, true)}>Approve & Release Payment</Button>
              <Button size="sm" variant="destructive" onClick={() => onReviewEvidence(m.id, false)}>Reject</Button>
            </div>
          )}
          
          {m.evidenceText && (
            <div className="mt-4 p-3 bg-muted rounded text-xs font-mono">
              <span className="font-bold">Evidence:</span> {m.evidenceText}
            </div>
          )}
        </div>
      ))}
      {milestones.length === 0 && <p className="text-muted-foreground text-sm">No milestones defined yet.</p>}
    </div>
  );
}

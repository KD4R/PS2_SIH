"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MilestoneDetail } from "@/types/api";
import { EvidenceUpload } from "./evidence-upload";
import { Loader2 } from "lucide-react";

export function MilestoneTracker({
  milestones,
  role,
  onUploadSuccess,
  onReviewEvidence
}: {
  milestones: MilestoneDetail[];
  role: string;
  onUploadSuccess: () => void;
  onReviewEvidence: (id: string, approved: boolean) => void;
}) {
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const handleApprove = (id: string) => {
    setProcessingId(id);
    setTimeout(() => {
      setProcessingId(null);
      onReviewEvidence(id, true);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {milestones.map(m => (
        <div key={m.id} className="border p-4 rounded-md bg-card">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold">{m.title}</h3>
            <Badge className={m.status === "completed" ? "bg-green-500 hover:bg-green-600" : "bg-secondary text-secondary-foreground"}>
              {m.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{m.description}</p>
          <div className="text-sm font-bold mb-4">Payment: ₹{m.paymentInr.toLocaleString()}</div>
          
          {m.status === "pending" && role === "startup_founder" && (
            <EvidenceUpload milestoneId={m.id} onUploadSuccess={onUploadSuccess} />
          )}
          
          {m.status === "evidence_submitted" && role === "department_officer" && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleApprove(m.id)} disabled={processingId === m.id}>Approve & Release Payment</Button>
              <Button size="sm" variant="destructive" onClick={() => onReviewEvidence(m.id, false)} disabled={processingId === m.id}>Reject</Button>
            </div>
          )}
          
          {/* Razorpay Fake Loading Modal - Task 5 from PRD */}
          {processingId === m.id && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-white font-bold text-2xl">₹</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Razorpay</h3>
                <p className="text-sm text-gray-500 font-medium text-center">
                  Transferring ₹{m.paymentInr.toLocaleString()} via NEFT...
                </p>
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mt-2" />
                <p className="text-xs text-gray-400 mt-2">Please do not close this window</p>
              </div>
            </div>
          )}
          
          {m.evidenceUrl && (
            <div className="mt-4 p-3 bg-muted rounded text-xs font-mono">
              <span className="font-bold">Evidence Uploaded:</span>{" "}
              {m.evidenceUrl.split('/').pop()}
            </div>
          )}
        </div>
      ))}
      {milestones.length === 0 && <p className="text-muted-foreground text-sm">No milestones defined yet.</p>}
    </div>
  );
}

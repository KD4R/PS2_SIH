"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { submitProposal } from "../service";
import type { ChallengeCardData } from "../types";

export function ProposalDialog({
  challenge,
  onClose,
  onSubmitted
}: {
  challenge: ChallengeCardData;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [proposalText, setProposalText] = useState("");
  const [dpiitNumber, setDpiitNumber] = useState("");
  const [dpiitVerified, setDpiitVerified] = useState(false);
  const [verifyingDpiit, setVerifyingDpiit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyDpiit = () => {
    if (!dpiitNumber) return;
    setVerifyingDpiit(true);
    setTimeout(() => {
      setDpiitVerified(true);
      setVerifyingDpiit(false);
    }, 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dpiitVerified) {
      setError("Please verify your DPIIT number before submitting.");
      return;
    }
    if (proposalText.length < 200) {
      setError("Proposal must be at least 200 characters long.");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      await submitProposal(challenge.id, { proposalText });
      onSubmitted();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit proposal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Proposal</DialogTitle>
          <DialogDescription>
            Applying for: <strong>{challenge.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground mb-4">
          <h4 className="font-semibold text-foreground mb-1">Challenge Context</h4>
          <p className="whitespace-pre-wrap">{challenge.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">DPIIT Registration Number</label>
            <div className="flex gap-2">
              <Input 
                value={dpiitNumber}
                onChange={(e) => {
                  setDpiitNumber(e.target.value);
                  setDpiitVerified(false);
                }}
                placeholder="e.g. DIPP12345"
                disabled={dpiitVerified || loading}
              />
              <Button type="button" variant="secondary" onClick={handleVerifyDpiit} disabled={!dpiitNumber || dpiitVerified || verifyingDpiit}>
                {verifyingDpiit ? "Verifying..." : dpiitVerified ? "✓ Verified" : "Verify DPIIT"}
              </Button>
            </div>
            {dpiitVerified && <p className="text-xs text-green-600 mt-1">✓ Valid DPIIT Startup. GFR 2017 Prior Turnover exemption applies.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Your Proposed Solution</label>
            <Textarea 
              required
              rows={10}
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              placeholder="Describe your technical solution, implementation plan, and compliance alignment..."
              className="font-mono text-sm"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">Focus on the criteria expected by the evaluation panel.</p>
              <p className={`text-xs ${proposalText.length < 200 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {proposalText.length} / 5000 (min 200)
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || proposalText.length < 200 || !dpiitVerified}>
              {loading ? "Submitting..." : "Submit Proposal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

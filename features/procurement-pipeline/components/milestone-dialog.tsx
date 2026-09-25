"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function MilestoneDialog({
  onClose,
  onSubmit
}: {
  onClose: () => void;
  onSubmit: (milestones: any[]) => void;
}) {
  const [milestones, setMilestones] = useState([
    { title: "Initial Sandbox Setup", description: "", paymentInr: 100000, dueDate: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleAutoGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setMilestones([
        {
          title: "Initial Sandbox Setup & Data Integration",
          description: "Startup must deploy the platform on a MeitY empaneled staging environment and successfully ingest 10,000 anonymized property records via API.",
          paymentInr: 500000,
          dueDate: "2026-10-15"
        },
        {
          title: "Pilot Ward Analysis & Anomaly Generation",
          description: "Run the ML model on Ward A. Must successfully generate an anomaly report with at least 85% verified accuracy when ground-truthed by inspectors.",
          paymentInr: 1000000,
          dueDate: "2026-11-15"
        },
        {
          title: "Final Handoff & Inspector Training",
          description: "Deliver the final production dashboard. Conduct a training session for 20 municipal tax inspectors. Submit the final user manual and security audit certificate.",
          paymentInr: 1000000,
          dueDate: "2026-12-15"
        }
      ]);
      setGenerating(false);
    }, 1500);
  };

  const handleAdd = () => {
    setMilestones([...milestones, { title: "", description: "", paymentInr: 0, dueDate: "" }]);
  };

  const handleUpdate = (index: number, field: string, value: string | number) => {
    const next = [...milestones];
    (next[index] as any)[field] = value;
    setMilestones(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSubmit(
      milestones.map(m => ({
        ...m,
        paymentInr: typeof m.paymentInr === 'string' ? parseInt(m.paymentInr) : m.paymentInr,
        dueDate: m.dueDate ? new Date(m.dueDate).toISOString() : undefined
      }))
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Approve Pilot & Set Milestones</DialogTitle>
          <DialogDescription>
            Define the milestone-based payment schedule for this pilot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Button 
            type="button" 
            variant="secondary" 
            className="w-full mb-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200" 
            onClick={handleAutoGenerate} 
            disabled={loading || generating}
          >
            {generating ? "✨ Analyzing Risk Report & Generating..." : "✨ Auto-generate Milestones from Risk Officer's Report"}
          </Button>

          {milestones.map((ms, i) => (
            <div key={i} className="p-4 border rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm">Milestone {i + 1}</h4>
                {i > 0 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setMilestones(milestones.filter((_, idx) => idx !== i))}>
                    Remove
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Title</label>
                  <Input required value={ms.title} onChange={e => handleUpdate(i, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Payment (INR)</label>
                  <Input required type="number" min={0} value={ms.paymentInr} onChange={e => handleUpdate(i, 'paymentInr', parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Description & Evidence Required</label>
                <Textarea required value={ms.description} onChange={e => handleUpdate(i, 'description', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Due Date (Optional)</label>
                <Input type="date" value={ms.dueDate} onChange={e => handleUpdate(i, 'dueDate', e.target.value)} />
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={handleAdd} className="w-full">
            + Add Another Milestone
          </Button>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Approving..." : "Approve & Create Contract"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

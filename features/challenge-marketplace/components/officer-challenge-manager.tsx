"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronRight, CheckCircle2, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/** Task 2 from PRD — Auto-Generate from Grievances */
function AutoGenerateGrievanceButton({
  onGenerated,
}: {
  onGenerated: (data: { title?: string; description?: string; domain?: string; outcome?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [grievanceData, setGrievanceData] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!grievanceData.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/challenges/auto-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grievanceData }),
      });
      if (res.ok) {
        const data = await res.json();
        onGenerated(data);
        setOpen(false);
        setGrievanceData("");
      } else {
        alert("Failed to auto-generate. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="w-full bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 gap-2"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="size-4" />
        ✨ Auto-Generate from Grievances
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg border flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h3 className="text-base font-semibold">Auto-Generate from Citizen Grievances</h3>
                <p className="text-xs text-muted-foreground">AI will read the grievance data and structure a challenge</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Paste Public Grievance Data</label>
                <Textarea
                  rows={8}
                  value={grievanceData}
                  onChange={(e) => setGrievanceData(e.target.value)}
                  placeholder={"Paste citizen complaints, RTI queries, or public grievance portal data here...\n\nExample:\n- Multiple complaints about road potholes in Ward 7\n- 200+ complaints about water supply disruption\n- Frequent power outages reported via CPGRAMS"}
                  className="resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading || !grievanceData.trim()} className="gap-2">
                {loading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Generate Challenge
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function OfficerChallengeManager() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", domain: "IT", outcome: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMyChallenges = async () => {
    setLoading(true);
    try {
      // Create a specific endpoint or use existing to get officer's challenges
      const res = await fetch("/api/challenges/my-challenges");
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyChallenges();
  }, []);

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowCreate(false);
        setFormData({ title: "", description: "", domain: "IT", outcome: "" });
        fetchMyChallenges();
      } else {
        alert("Failed to create challenge");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;
    try {
      const res = await fetch(`/api/challenges/${id}`, { method: "DELETE" });
      if (res.ok) fetchMyChallenges();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="animate-pulse">Loading challenges...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Published Challenges</h2>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="size-4 mr-2" /> New Challenge
        </Button>
      </div>

      {showCreate && (
        <div className="p-6 bg-surface-elevated border border-border rounded-lg space-y-4">
          <h3 className="font-semibold text-lg">Create a New Problem Statement</h3>

          {/* ✨ Auto-Generate from Grievances — Task 2 from PRD */}
          <AutoGenerateGrievanceButton onGenerated={(data) => setFormData({
            title: data.title || formData.title,
            description: data.description || formData.description,
            domain: data.domain || formData.domain,
            outcome: data.outcome || formData.outcome,
          })} />

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Traffic Camera Latency Reduction" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Problem Description</label>
            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the current issue..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Expected Outcome</label>
            <Textarea value={formData.outcome} onChange={e => setFormData({ ...formData, outcome: e.target.value })} placeholder="What does success look like?" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isSubmitting || !formData.title || !formData.outcome}>Publish Challenge</Button>
          </div>
        </div>
      )}


      {challenges.length === 0 && !showCreate ? (
        <div className="text-center py-12 text-muted-foreground bg-surface rounded-lg border border-border border-dashed">
          You haven't published any challenges yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {challenges.map(c => (
            <div key={c.id} className="p-5 bg-surface border border-border rounded-lg flex items-center justify-between group hover:border-primary/50 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{c.title}</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{c.status}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{c.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-4" />
                </Button>
                <Button onClick={() => router.push(`/challenges/${c.id}/pipeline`)}>
                  View Proposals <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

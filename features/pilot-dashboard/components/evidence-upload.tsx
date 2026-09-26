"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadMilestoneEvidence } from "@/features/pilot-dashboard/service";

export function EvidenceUpload({ milestoneId, onUploadSuccess }: { milestoneId: string, onUploadSuccess: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    
    try {
      await uploadMilestoneEvidence(milestoneId, file);
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      <input 
        type="file" 
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-sm border p-1 rounded bg-background"
        disabled={uploading}
      />
      {error && <div className="text-red-500 text-xs">{error}</div>}
      <Button 
        size="sm" 
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? "Uploading..." : "Upload Evidence"}
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type VerificationState = "Pending" | "Verified" | "Rejected" | "None";

interface FileUploadProps {
  id: string;
  label: string;
  accept?: string;
  initialState?: VerificationState;
  onUpload?: (file: File) => void;
  className?: string;
}

export function FileUpload({ 
  id, 
  label, 
  accept = ".pdf", 
  initialState = "None",
  onUpload,
  className
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<VerificationState>(initialState);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setState("Pending");
      if (onUpload) {
        onUpload(selectedFile);
      }
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors", 
      state === "Verified" ? "border-green-300 bg-green-50" : 
      state === "Rejected" ? "border-red-300 bg-red-50" : 
      "border-border bg-muted/10 hover:bg-muted/30",
      className
    )}>
      <Label htmlFor={id} className="cursor-pointer text-sm font-medium text-primary hover:underline text-center">
        {file ? file.name : label}
      </Label>
      <input 
        id={id} 
        type="file" 
        accept={accept} 
        className="hidden" 
        onChange={handleFileChange}
      />
      
      {state !== "None" && (
        <div className="mt-2 text-xs font-medium flex items-center gap-1">
          {state === "Pending" && <span className="text-amber-600">⌛ Verification Pending</span>}
          {state === "Verified" && <span className="text-green-600">✓ Verified</span>}
          {state === "Rejected" && <span className="text-red-600">✕ Rejected</span>}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Download, Eye, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/lib/demo/toast";
import { downloadTemplatePdf } from "@/lib/demo/pdf";
import type { Template } from "@/lib/demo/types";

const KIND_LABEL: Record<Template["kind"], string> = {
  problem: "Problem Statement",
  evaluation: "Evaluation Criteria",
  pilot: "Pilot Agreement",
  dataip: "Data & IP Clauses",
  cyber: "Cybersecurity Annex",
  risk: "Risk Register",
  pathway: "Procurement Pathway",
};

/** F1 template grid card actions: preview, attach (toast), download PDF. */
export function TemplateActions({ template, size = "sm" }: { template: Template; size?: "sm" | "md" }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size={size} onClick={() => setOpen(true)}>
        <Eye className="h-3.5 w-3.5" /> Preview
      </Button>
      <Button
        variant="outline"
        size={size}
        onClick={() => toast(`Template attached: ${KIND_LABEL[template.kind]}`, "info")}
      >
        <FileCheck2 className="h-3.5 w-3.5" /> Use template
      </Button>
      <Button size={size} onClick={() => downloadTemplatePdf(template)}>
        <Download className="h-3.5 w-3.5" /> PDF
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{template.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{template.description}</p>
          <div className="space-y-4">
            {template.sections.map((section, i) => (
              <div key={i} className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground">
                  {i + 1}. {section.heading}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{section.body}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Illustrative data. Verify rule wording against current GFR/DPIIT guidelines before real use.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

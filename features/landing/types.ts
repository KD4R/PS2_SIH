import type { LucideIcon } from "lucide-react";
import type { ExecutiveRole } from "@/components/shared/executive-card";

export interface StatDatum {
  label: string;
  value: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface BoardExecutivePreview {
  name: string;
  role: ExecutiveRole;
  trait: string;
  quote: string;
}

export interface DeliverableFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

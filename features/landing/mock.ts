import {
  Gavel,
  ClipboardList,
  LineChart,
  Calculator,
  Presentation,
  Map,
  FileText,
  ScrollText,
} from "lucide-react";
import type {
  StatDatum,
  ProcessStep,
  BoardExecutivePreview,
  DeliverableFeature,
} from "./types";

export const heroStats: StatDatum[] = [
  { label: "Challenges published", value: "1,240" },
  { label: "Avg. days to first payment", value: "21" },
  { label: "Pilots completed this year", value: "312" },
];

export const processSteps: ProcessStep[] = [
  {
    step: "01",
    title: "Pick a live challenge",
    description: "Departments publish outcome-based problem statements. Check eligibility in one click — DPIIT startups get relaxations automatically.",
  },
  {
    step: "02",
    title: "Get evaluated transparently",
    description:
      "Proposals are scored against published criteria with AI-assisted evaluation and independent assessors — every score on the record.",
  },
  {
    step: "03",
    title: "Pilot, get paid, scale up",
    description:
      "Run a sandboxed pilot with milestone payments, independent validation, and a route into full procurement when KPIs are met.",
  },
];

export const boardExecutives: BoardExecutivePreview[] = [
  {
    name: "Priya Nair",
    role: "Procurement Officer",
    trait: "Outcome-focused",
    quote: "Show me the outcome, not the brochure — who does this help, and when?",
  },
  {
    name: "Rahul Verma",
    role: "Technical Assessor",
    trait: "Feasibility-first",
    quote: "Hardware that ships beats a slide deck every time. I score what can deploy.",
  },
  {
    name: "Ananya Iyer",
    role: "Legal Advisor",
    trait: "Reads the fine print",
    quote: "Compliance isn't a blocker. It's what keeps the contract valid later.",
  },
  {
    name: "Vikram Shetty",
    role: "Finance Analyst",
    trait: "Cost-disciplined",
    quote: "A rupee released against a verified milestone is a rupee accounted for.",
  },
  {
    name: "Sana Qureshi",
    role: "Data & IP Reviewer",
    trait: "Sovereignty-minded",
    quote: "Data stays in India, IP stays with the builder. Both are negotiable on paper, not in practice.",
  },
  {
    name: "Arjun Mehta",
    role: "Cyber & Risk Reviewer",
    trait: "Assumes breach",
    quote: "Sandbox the pilot, cap the spend, and keep the kill switch within reach.",
  },
];

export const deliverables: DeliverableFeature[] = [
  { icon: Gavel, title: "Transparent verdict", description: "A clear recommend, conditional, or not recommended — with every score on the record." },
  { icon: ClipboardList, title: "SWOT analysis", description: "Strengths, weaknesses, opportunities, and threats, scored by dimension." },
  { icon: LineChart, title: "Market research", description: "Sizing, competitors, and positioning, pressure-tested by the board." },
  { icon: Calculator, title: "Milestone-based payments", description: "Funds released against verified outcomes, not paperwork — the average payment lands in three weeks." },
  { icon: Presentation, title: "Pilot agreement", description: "A sandboxed pilot contract generated from the published templates — scope, KPIs, and exit clauses included." },
  { icon: Map, title: "Scale-up decision", description: "Independent validation feeds a clear choice: scale to more districts, convert to procurement, or close." },
  { icon: FileText, title: "Audit-ready reports", description: "Every score, release, and decision logged with actor and timestamp — ready for RTI and CAG review." },
  { icon: ScrollText, title: "Public transparency", description: "Published counters for challenges, pilots, and payments so citizens can see the pipeline move." },
];



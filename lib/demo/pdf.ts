"use client";

import { jsPDF } from "jspdf";
import type { Evaluation, Pilot, Proposal, Template } from "./types";

const MARGIN = 20;
const WIDTH = 170;
const BOTTOM = 280;

interface DocState {
  doc: jsPDF;
  y: number;
}

function heading(s: DocState, text: string, size = 15) {
  if (s.y > BOTTOM - 20) {
    s.doc.addPage();
    s.y = MARGIN;
  }
  s.doc.setFontSize(size);
  s.doc.setFont("helvetica", "bold");
  const lines = s.doc.splitTextToSize(text, WIDTH);
  s.doc.text(lines, MARGIN, s.y);
  s.y += lines.length * (size / 2 + 2);
}

function para(s: DocState, text: string, size = 10.5) {
  s.doc.setFontSize(size);
  s.doc.setFont("helvetica", "normal");
  const lines = s.doc.splitTextToSize(text, WIDTH) as string[];
  for (const line of lines) {
    if (s.y > BOTTOM) {
      s.doc.addPage();
      s.y = MARGIN;
    }
    s.doc.text(line, MARGIN, s.y);
    s.y += size / 2 + 1.5;
  }
  s.y += 3;
}

function kv(s: DocState, rows: [string, string][]) {
  s.doc.setFontSize(10.5);
  for (const [key, value] of rows) {
    if (s.y > BOTTOM) {
      s.doc.addPage();
      s.y = MARGIN;
    }
    s.doc.setFont("helvetica", "bold");
    s.doc.text(`${key}:`, MARGIN, s.y);
    s.doc.setFont("helvetica", "normal");
    s.doc.text(s.doc.splitTextToSize(value, WIDTH - 55) as string[], MARGIN + 55, s.y);
    s.y += 7;
  }
  s.y += 3;
}

function footer(s: DocState) {
  const pages = s.doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    s.doc.setPage(i);
    s.doc.setFontSize(8);
    s.doc.setFont("helvetica", "italic");
    s.doc.setTextColor(120);
    s.doc.text("Illustrative document generated from platform data.", MARGIN, 290);
    s.doc.setTextColor(0);
  }
}

function save(doc: jsPDF, name: string) {
  doc.save(`${name}.pdf`);
}

function baseDoc(title: string): DocState {
  const doc = new jsPDF();
  const s: DocState = { doc, y: MARGIN };
  heading(s, title, 17);
  para(s, `Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, 9.5);
  s.y += 4;
  return s;
}

export function downloadTemplatePdf(template: Template) {
  const s = baseDoc(template.title);
  para(s, template.description);
  template.sections.forEach((section, i) => {
    heading(s, `${i + 1}. ${section.heading}`, 13);
    para(s, section.body);
  });
  footer(s);
  save(s.doc, `${template.title.replace(/[^\w]+/g, "_")}`);
}

export function downloadContractPdf(pilot: Pilot, opts: { challengeTitle: string; startupName: string; department: string }) {
  const s = baseDoc("Pilot Agreement and Milestone Payment Schedule");
  kv(s, [
    ["Department", opts.department],
    ["Startup", opts.startupName],
    ["Challenge", opts.challengeTitle],
    ["Contract value", `INR ${pilot.contractValue.toLocaleString("en-IN")}`],
    ["Duration", `${new Date(pilot.startDate).toLocaleDateString("en-IN")} to ${new Date(pilot.endDate).toLocaleDateString("en-IN")}`],
  ]);
  heading(s, "1. Scope", 13);
  para(s, `The startup will deliver the solution within the sandbox area: ${pilot.sandbox.area}. Duration: ${pilot.sandbox.durationWeeks} weeks with a budget cap of INR ${pilot.sandbox.budgetCap.toLocaleString("en-IN")}.`);
  heading(s, "2. Milestone payment schedule", 13);
  for (const m of pilot.milestones) {
    para(s, `${m.title} — ${m.paymentPct}% (INR ${m.amount.toLocaleString("en-IN")}) — ${m.kpi}. Status: ${m.status}. Due ${new Date(m.dueDate).toLocaleDateString("en-IN")}.`);
  }
  heading(s, "3. Data and IP", 13);
  para(s, pilot.compliance.ipClause);
  heading(s, "4. Cybersecurity", 13);
  para(s, "All data is hosted within India. The startup complies with CERT-In guidelines; encryption at rest and in transit is mandatory. Incident-response contact: " + pilot.compliance.incidentContact);
  footer(s);
  save(s.doc, `Pilot_Agreement_${opts.startupName.replace(/\s+/g, "_")}`);
}

export function downloadEvaluationPdf(evaluation: Evaluation, opts: { startupName: string; challengeTitle: string }) {
  const s = baseDoc("Proposal Evaluation Report");
  kv(s, [
    ["Startup", opts.startupName],
    ["Challenge", opts.challengeTitle],
    ["Total score", `${evaluation.total} / 100`],
    ["Verdict", evaluation.verdict],
  ]);
  heading(s, "Criterion scores", 13);
  for (const sc of evaluation.scores) {
    para(s, `${sc.criterion}: ${sc.score}/100 (weight ${sc.weight}%)`);
  }
  heading(s, "Evaluation board notes", 13);
  for (const note of evaluation.agentNotes) {
    para(s, `${note.agent}: ${note.note}`);
  }
  footer(s);
  save(s.doc, `Evaluation_${opts.startupName.replace(/\s+/g, "_")}`);
}

export function downloadPilotSummaryPdf(pilot: Pilot, opts: { startupName: string; challengeTitle: string }) {
  const s = baseDoc("Pilot Summary");
  kv(s, [
    ["Startup", opts.startupName],
    ["Challenge", opts.challengeTitle],
    ["Status", pilot.status],
    ["Contract value", `INR ${pilot.contractValue.toLocaleString("en-IN")}`],
  ]);
  heading(s, "KPI performance", 13);
  for (const k of pilot.kpis) {
    para(s, `${k.label}: baseline ${k.baseline}${k.unit === "%" ? "%" : ""}, target ${k.target}, actual ${k.actual} (${k.unit})`);
  }
  heading(s, "Milestones", 13);
  for (const m of pilot.milestones) {
    para(s, `${m.title} — ${m.status} — INR ${m.amount.toLocaleString("en-IN")}`);
  }
  heading(s, "Sandbox and risks", 13);
  para(s, `Area: ${pilot.sandbox.area}. Kill switch: ${pilot.sandbox.killSwitchActive ? "ACTIVE" : "standby"}.`);
  for (const r of pilot.risks) {
    para(s, `Risk: ${r.title} (${r.likelihood}/${r.impact}) — mitigation: ${r.mitigation}`);
  }
  footer(s);
  save(s.doc, `Pilot_Summary_${opts.startupName.replace(/\s+/g, "_")}`);
}

/** Convenience for proposal pages that hold the full proposal object. */
export function proposalTitle(proposal: Proposal): string {
  return proposal.summary.slice(0, 60);
}

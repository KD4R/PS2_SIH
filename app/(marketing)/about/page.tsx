import type { Metadata } from "next";
import { SectionHeader } from "@/components/shared/section-header";
import { Card } from "@/components/ui/card";
import { ExecutiveCard } from "@/components/shared/executive-card";
import { boardExecutives } from "@/features/landing/mock";

export const metadata: Metadata = { title: "About" };

const values = [
  {
    title: "Outcomes over paperwork",
    description:
      "Every challenge is published as a measurable outcome statement, and every payment is tied to verified evidence against it.",
  },
  {
    title: "Transparent by default",
    description:
      "Scores, decisions, payments and validation findings live on an audit trail that startups and citizens can both inspect.",
  },
  {
    title: "Startups as first-class vendors",
    description:
      "DPIIT recognition carries automatic relaxations — no earnest money deposit, turnover and prior-experience waivers — without special pleading.",
  },
];

export default function AboutPage() {
  return (
    <div className="container space-y-20 py-20">
      <SectionHeader
        eyebrow="About"
        title="A procurement pathway built around outcomes"
        description="GovProcure AI replaces the specification-and-tender grind with a challenge-to-scale pathway: departments publish outcome-based challenges, startups bid with relaxations applied automatically, pilots pay only on verified milestones, and independent validation gates the scale-up decision."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {values.map((value) => (
          <Card key={value.title} className="p-6">
            <h3 className="text-lg font-medium">{value.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <SectionHeader eyebrow="The evaluation board" title="Who reviews every proposal" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {boardExecutives.map((exec) => (
            <ExecutiveCard key={exec.name} name={exec.name} role={exec.role} trait={exec.trait} quote={exec.quote} />
          ))}
        </div>
      </div>
    </div>
  );
}

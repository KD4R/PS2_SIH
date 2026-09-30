import type { Metadata } from "next";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/features/landing/components/hero";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { ExecutivesShowcase } from "@/features/landing/components/executives-showcase";
import { FeaturesGrid } from "@/features/landing/components/features-grid";
import { CtaBanner } from "@/features/landing/components/cta-banner";

export const metadata: Metadata = {
  title: "GovProcure AI — Public Procurement Mechanism",
  description:
    "From open challenge to pilot to payment — a startup-friendly public procurement pathway with AI-assisted evaluation, milestone-based payments, and audit-ready transparency.",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col noise-overlay">
      <MarketingNavbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ExecutivesShowcase />
        <FeaturesGrid />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}

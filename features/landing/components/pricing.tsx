"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    description: "For small departments and pilot programs",
    price: { monthly: 0, annual: 0 },
    features: [
      "Up to 10 tenders per month",
      "Basic AI evaluation",
      "Standard compliance checks",
      "Email support",
      "Public dashboard",
    ],
    cta: "Start free",
    popular: false,
  },
  {
    name: "Professional",
    description: "For state-level procurement bodies",
    price: { monthly: 49999, annual: 41999 },
    features: [
      "Unlimited tenders",
      "Advanced AI evaluation",
      "Anomaly & cartel detection",
      "Priority support",
      "Custom compliance rules",
      "Multi-department access",
      "API access",
    ],
    cta: "Start trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For central government and large states",
    price: { monthly: null, annual: null },
    features: [
      "Everything in Professional",
      "On-premise deployment",
      "24/7 dedicated support",
      "Custom AI model training",
      "SLA guarantee",
      "STQC certification support",
      "Unlimited users",
      "Custom integrations",
    ],
    cta: "Contact sales",
    popular: false,
  },
];

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="relative py-32 lg:py-40 border-t border-border">
      <div className="container">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase block mb-6">
            Pricing
          </span>
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl tracking-tight text-foreground mb-6">
            Simple, transparent
            <br />
            <span className="text-primary">pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Start free for pilot programs. Scale as your procurement modernizes. No hidden fees.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center gap-4 mb-16">
          <span className={`text-sm transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-14 h-7 bg-surface-elevated rounded-full p-1 transition-colors hover:bg-accent"
          >
            <div
              className={`w-5 h-5 bg-primary rounded-full transition-transform duration-300 ${
                isAnnual ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm transition-colors ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
          </span>
          {isAnnual && (
            <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-mono rounded">
              Save 16%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative p-8 lg:p-12 bg-background ${
                plan.popular ? "md:-my-4 md:py-12 lg:py-16 border-2 border-primary rounded-xl z-10" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-8 px-3 py-1 bg-primary text-primary-foreground text-xs font-mono uppercase tracking-widest rounded">
                  Most Popular
                </span>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-3xl text-foreground mt-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-border">
                {plan.price.monthly !== null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl lg:text-6xl text-foreground">
                      ₹{((isAnnual ? plan.price.annual : plan.price.monthly) / 1000).toFixed(0)}K
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                ) : (
                  <span className="font-display text-4xl text-foreground">Custom</span>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/login?next=/meeting/new"
                className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all group rounded-lg ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border text-foreground hover:border-border-strong hover:bg-surface-elevated"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          All plans include HTTPS, DDoS protection, and compliance reporting.{" "}
          <a href="#" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Compare all features
          </a>
        </p>
      </div>
    </section>
  );
}

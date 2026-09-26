"use client";

import { useEffect, useState, useRef } from "react";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "GFR Compliant",
    description: "Every procurement step adheres to General Financial Rules and state-specific regulations automatically.",
  },
  {
    icon: Lock,
    title: "End-to-end encryption",
    description: "AES-256 encryption for bid data at rest and TLS 1.3 in transit. Tamper-proof document hashing.",
  },
  {
    icon: Eye,
    title: "Zero-trust architecture",
    description: "Role-based access control ensures only authorized officers can view, evaluate, or approve bids.",
  },
  {
    icon: FileCheck,
    title: "Audit trail",
    description: "Every action is logged with timestamps, user IDs, and digital signatures — ready for RTI and CAG audits.",
  },
];

const certifications = ["GFR", "GeM", "ISO 27001", "STQC", "CERT-IN"];

export function ExecutivesShowcase() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="executives" ref={sectionRef} className="relative py-24 lg:py-32 bg-surface/60 overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Security &amp; compliance
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              Trust is
              <br />
              non-negotiable.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              Government-grade security built into every layer.
              From bid submission to contract award, your procurement data stays sovereign and secure.
            </p>

            {/* Certifications */}
            <div className="flex flex-wrap gap-3">
              {certifications.map((cert, index) => (
                <span
                  key={cert}
                  className={`px-4 py-2 border border-border text-sm font-mono transition-all duration-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 50 + 200}ms` }}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Features */}
          <div className="grid gap-6">
            {securityFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`p-6 border border-border hover:border-border-strong transition-all duration-500 group rounded-xl ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 flex items-center justify-center border border-border rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1 group-hover:translate-x-1 transition-transform duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

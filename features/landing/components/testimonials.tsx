"use client";

import { useEffect, useState } from "react";

const testimonials = [
  {
    quote: "GovProcure AI cut our tender evaluation time by 80%. What took weeks now happens in hours with complete transparency.",
    author: "Rajesh Kumar",
    role: "Director of Procurement",
    company: "Ministry of Railways",
    metric: "80% faster evaluation",
  },
  {
    quote: "The AI-powered anomaly detection caught bid-rigging patterns we'd never have found manually. A game-changer for fair procurement.",
    author: "Priya Sharma",
    role: "Chief Vigilance Officer",
    company: "State PWD",
    metric: "12 fraudulent bids flagged",
  },
  {
    quote: "Citizens can now track procurement status in real-time. It's built trust like nothing we've tried before.",
    author: "Amit Patel",
    role: "District Collector",
    company: "Gujarat",
    metric: "92% citizen satisfaction",
  },
  {
    quote: "The audit trail feature saved us months of documentation work. CAG auditors were impressed by the completeness.",
    author: "Dr. Meera Nair",
    role: "Finance Secretary",
    company: "Kerala",
    metric: "100% audit readiness",
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section className="relative py-32 lg:py-40 border-t border-border lg:pb-14">
      <div className="container">
        {/* Section Label */}
        <div className="flex items-center gap-4 mb-16">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            What officials say
          </span>
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono text-xs text-muted-foreground">
            {String(activeIndex + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
          </span>
        </div>

        {/* Main Quote */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-8">
            <blockquote
              className={`transition-all duration-300 ${
                isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              }`}
            >
              <p className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-foreground">
                &ldquo;{activeTestimonial.quote}&rdquo;
              </p>
            </blockquote>

            {/* Author */}
            <div
              className={`mt-12 flex items-center gap-6 transition-all duration-300 delay-100 ${
                isAnimating ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center">
                <span className="font-display text-2xl text-foreground">
                  {activeTestimonial.author.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">{activeTestimonial.author}</p>
                <p className="text-muted-foreground">
                  {activeTestimonial.role}, {activeTestimonial.company}
                </p>
              </div>
            </div>
          </div>

          {/* Metric Highlight */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div
              className={`p-8 border border-border rounded-xl transition-all duration-300 ${
                isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase block mb-4">
                Key Result
              </span>
              <p className="font-display text-3xl md:text-4xl text-foreground">
                {activeTestimonial.metric}
              </p>
            </div>

            {/* Navigation Dots */}
            <div className="flex gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setActiveIndex(idx);
                      setIsAnimating(false);
                    }, 300);
                  }}
                  className={`h-2 rounded-sm transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-foreground/20 hover:bg-foreground/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Organizations Marquee */}
        <div className="mt-24 pt-12 border-t border-border">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase mb-8 text-center">
            Trusted by government bodies nationwide
          </p>
        </div>
      </div>

      {/* Full-width marquee */}
      <div className="w-full">
        <div className="flex gap-16 items-center marquee">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex gap-16 items-center shrink-0">
              {[
                "Ministry of Railways",
                "NHAI",
                "State PWD",
                "Municipal Corp.",
                "Defence Ministry",
                "Health Ministry",
                "Education Dept.",
                "Smart Cities Mission",
              ].map((org) => (
                <span
                  key={`${setIdx}-${org}`}
                  className="font-display text-xl md:text-2xl text-foreground/30 whitespace-nowrap hover:text-foreground transition-colors duration-300"
                >
                  {org}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

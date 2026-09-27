"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicPortal() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">G</div>
            <h1 className="text-2xl font-bold tracking-tight">GovProcure<span className="text-primary text-sm align-top ml-1">PUBLIC</span></h1>
          </div>
          <div className="flex gap-4">
            <Link href="/login"><Button variant="ghost">Log in</Button></Link>
            <Link href="/signup"><Button>Join as Innovator</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20 border-b">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-5xl font-display font-extrabold tracking-tight">Transparent Public Procurement</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track successful pilot programs and scaled innovations across government departments. 
            We believe in outcome-based transparency.
          </p>
        </div>
      </section>

      {/* Directory */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h3 className="text-2xl font-bold">Innovation Directory</h3>
            <p className="text-muted-foreground mt-2">Showing completed and scaled projects</p>
          </div>
          <select className="border rounded-md px-4 py-2 text-sm bg-card shadow-sm outline-none focus:ring-2 focus:ring-primary">
            <option>All Sectors</option>
            <option>HealthTech</option>
            <option>CivicTech</option>
            <option>AgriTech</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { 
              title: "AI Traffic Signal Optimization", 
              dept: "Dept of Transport, Delhi", 
              startup: "FlowAI Technologies", 
              outcome: "Reduced average wait times at 15 major intersections by 34%. System fully integrated with central traffic control.", 
              status: "Scaled State-wide",
              tag: "Mobility"
            },
            { 
              title: "Drone-based Crop Assessment", 
              dept: "Ministry of Agriculture", 
              startup: "AeroAgri", 
              outcome: "Successfully surveyed 10,000 hectares for pest damage with 95% accuracy compared to manual inspection.", 
              status: "Pilot Completed",
              tag: "AgriTech"
            },
            { 
              title: "Digital Health Records Kiosk", 
              dept: "Health Ministry, Karnataka", 
              startup: "Innovator (Anonymized by request)", 
              outcome: "Deployed in 50 rural PHCs. Handled 25,000 patient check-ins, reducing administrative burden by 40%.", 
              status: "Scaled Regionally",
              tag: "HealthTech"
            },
            { 
              title: "Water Quality IoT Sensors", 
              dept: "Jal Board", 
              startup: "AquaSense Solutions", 
              outcome: "Real-time detection of contaminants across 5 treatment plants. Alert system triggered 3 preventive maintenance events.", 
              status: "Scaled State-wide",
              tag: "CivicTech"
            },
            { 
              title: "Smart Waste Bins", 
              dept: "Municipal Corporation", 
              startup: "EcoRoute", 
              outcome: "Optimized garbage truck routing reduced fuel consumption by 18% during the 3-month pilot phase.", 
              status: "Pilot Completed",
              tag: "CivicTech"
            }
          ].map((project, i) => (
            <div key={i} className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
              <div className="mb-4 flex justify-between items-start">
                <span className="text-xs font-semibold px-2 py-1 bg-muted rounded text-muted-foreground">{project.tag}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${project.status.includes('Scaled') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {project.status}
                </span>
              </div>
              <h4 className="text-lg font-bold mb-1">{project.title}</h4>
              <p className="text-sm font-medium text-primary mb-4">{project.dept}</p>
              
              <div className="mt-auto pt-4 border-t border-muted">
                <div className="mb-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Solution By</span>
                  <p className="text-sm font-medium">{project.startup}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Outcome Summary</span>
                  <p className="text-sm text-foreground/80 mt-1">{project.outcome}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

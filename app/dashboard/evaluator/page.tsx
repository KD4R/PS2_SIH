"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, FileText, Cpu, Clock, Building, CheckCircle2 } from "lucide-react";

const CHALLENGES = {
  "AI Traffic Management System": {
    department: "Department of Transport",
    startups: ["TechNova Innovations", "CityGrid Systems", "MetroSense"],
  },
  "Water Quality Sensor Network": {
    department: "Delhi Jal Board",
    startups: ["AquaTech Solutions", "HydroMetrics AI", "CleanDrop"],
  },
  "Drone Crop Survey": {
    department: "Agriculture",
    startups: ["AeroFarms", "SkyYield", "AgriDrone Pro"],
  }
};

export default function EvaluatorDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedChallenge, setSelectedChallenge] = useState<keyof typeof CHALLENGES>("AI Traffic Management System");
  const [selectedStartup, setSelectedStartup] = useState(CHALLENGES["AI Traffic Management System"].startups[0]);
  const [scores, setScores] = useState({ tech: 50, scale: 50, cost: 50, risk: 50 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedEvals, setCompletedEvals] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSolutionDetails, setShowSolutionDetails] = useState(false);

  const handleChallengeChange = (challenge: keyof typeof CHALLENGES) => {
    setSelectedChallenge(challenge);
    setSelectedStartup(CHALLENGES[challenge].startups[0]);
  };

  return (
    <div className="flex h-screen bg-muted/20 relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 flex items-center justify-between">
          <div>
            <Link href="/">
              <h2 className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">GovProcure</h2>
            </Link>
            <p className="text-xs text-muted-foreground">Evaluator Panel</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: "pending", label: "Pending evaluations" },
            { id: "completed", label: "Completed" },
            { id: "settings", label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 hover:translate-x-1 ${activeTab === item.id ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center px-4 sm:px-8 shadow-sm justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-semibold">Evaluation:</h1>
              <div className="relative flex items-center">
                <select 
                  className="bg-transparent font-medium text-base text-primary outline-none cursor-pointer appearance-none pr-5 hover:text-primary/80 transition-colors"
                  value={selectedChallenge}
                  onChange={(e) => handleChallengeChange(e.target.value as keyof typeof CHALLENGES)}
                >
                  {Object.keys(CHALLENGES).map((challenge) => (
                    <option key={challenge} value={challenge}>{challenge}</option>
                  ))}
                </select>
                <svg className="w-4 h-4 text-primary absolute right-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{CHALLENGES[selectedChallenge].department}</p>
          </div>
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 font-medium flex items-center justify-center border">EV</div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          {activeTab === "pending" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
              
              {/* Queue & Comparative View */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300">
                <div className="p-4 border-b bg-muted/20">
                  <h3 className="font-semibold">Shortlisted Startups</h3>
                  <p className="text-xs text-muted-foreground">Identities are anonymized</p>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-2">
                  {CHALLENGES[selectedChallenge].startups.map((s, index) => {
                    const isCompleted = completedEvals.includes(s);
                    return (
                      <div 
                        key={s} 
                        onClick={() => setSelectedStartup(s)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/50 ${selectedStartup === s ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-muted/50'}`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">{s}</span>
                          {isCompleted ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Done</span>
                          ) : index === 0 ? (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">In Progress</span>
                          ) : (
                            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">Pending</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Scoring Interface */}
            <div className="lg:col-span-2">
              <div className="bg-card border rounded-xl shadow-sm overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-300">
                <div className="p-6 border-b bg-muted/20 flex justify-between items-center relative">
                  {completedEvals.includes(selectedStartup) && (
                    <div className="absolute top-4 right-1/2 translate-x-1/2 bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-md font-medium border border-green-200 animate-in fade-in slide-in-from-top-2">
                      ✓ Scores locked
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-xl">Scoring: {selectedStartup}</h3>
                    <p className="text-sm text-muted-foreground">Review pitch and assign scores.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="text-primary border-primary hover:bg-primary/5 hover:scale-105 transition-all"
                    onClick={() => setShowSolutionDetails(true)}
                  >
                    View Solution Details
                  </Button>
                </div>
                
                <div className="p-8 flex-1 overflow-auto space-y-8">
                  {/* Rubrics */}
                  <div className="space-y-6">
                    {[
                      { key: 'tech', label: "Technical Feasibility", desc: "Is the technology mature and viable?" },
                      { key: 'scale', label: "Scalability", desc: "Can it be deployed state-wide?" },
                      { key: 'cost', label: "Cost Effectiveness", desc: "ROI compared to traditional methods." },
                      { key: 'risk', label: "Risk & Compliance", desc: "Data security, IP, and operational risks." }
                    ].map(rubric => (
                      <div key={rubric.key} className="space-y-3 group">
                        <div className="flex justify-between items-end">
                          <div>
                            <label className="font-medium group-hover:text-primary transition-colors">{rubric.label}</label>
                            <p className="text-xs text-muted-foreground">{rubric.desc}</p>
                          </div>
                          <span className="font-display font-bold text-lg text-primary">{scores[rubric.key as keyof typeof scores]} / 100</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={scores[rubric.key as keyof typeof scores]}
                          onChange={(e) => setScores({...scores, [rubric.key]: parseInt(e.target.value)})}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={completedEvals.includes(selectedStartup)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t mt-8">
                    <label className="block font-medium mb-2">Evaluator Notes (Optional)</label>
                    <textarea 
                      className="w-full border rounded-lg p-3 min-h-[100px] text-sm disabled:opacity-50 disabled:bg-muted" 
                      placeholder="Provide justification for your scores..."
                      disabled={completedEvals.includes(selectedStartup)}
                    ></textarea>
                  </div>
                </div>

                <div className="p-6 border-t bg-muted/10 flex justify-between items-center">
                  <div className="text-sm font-medium">
                    Total Score: <span className="text-2xl font-bold text-primary ml-2">{Math.round((scores.tech + scores.scale + scores.cost + scores.risk) / 4)}</span>
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 hover:scale-[1.02] transition-all shadow-md hover:shadow-lg"
                    disabled={isSubmitting || completedEvals.includes(selectedStartup)}
                    onClick={() => {
                      setIsSubmitting(true);
                      setTimeout(() => {
                        setIsSubmitting(false);
                        if (!completedEvals.includes(selectedStartup)) {
                          setCompletedEvals([...completedEvals, selectedStartup]);
                        }
                      }, 1200);
                    }}
                  >
                    {isSubmitting ? "Locking..." : completedEvals.includes(selectedStartup) ? "Scores Locked" : "Submit & Lock Scores"}
                  </Button>
                </div>
              </div>
            </div>
            </div>
          )}

          {activeTab === "completed" && (
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-8 min-h-[400px]">
              <h3 className="text-2xl font-semibold mb-6">Completed Evaluations</h3>
              {completedEvals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground opacity-50" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground">No evaluations completed yet.</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Finish scoring startups in the pending tab.</p>
                  <Button variant="outline" className="mt-6" onClick={() => setActiveTab("pending")}>Go to Pending</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedEvals.map((s, i) => (
                    <div key={i} className="p-4 border rounded-lg flex items-center justify-between hover:shadow-md hover:-translate-y-1 hover:border-primary/50 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <div>
                          <h4 className="font-semibold text-lg">{s}</h4>
                          <p className="text-sm text-muted-foreground">Evaluation submitted successfully</p>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm">View Scorecard</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden p-8 min-h-[400px]">
              <h3 className="text-2xl font-semibold mb-6">Evaluator Settings</h3>
              <div className="space-y-6 max-w-xl">
                <div className="p-4 border rounded-lg bg-muted/20">
                  <h4 className="font-medium mb-1">Domain Expertise Profile</h4>
                  <p className="text-sm text-muted-foreground mb-4">Select the domains you are qualified to evaluate.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full">Artificial Intelligence</span>
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full">Urban Mobility</span>
                    <span className="px-3 py-1 border text-xs rounded-full">Agriculture Tech</span>
                    <span className="px-3 py-1 border text-xs rounded-full">Cybersecurity</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Notification Preferences</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
                      <span className="text-sm">Email me when a new challenge needs evaluation</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
                      <span className="text-sm">Email me 24h before evaluation deadline</span>
                    </label>
                  </div>
                </div>
                
                <Button>Save Preferences</Button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Solution Details Modal */}
      {showSolutionDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-3xl rounded-xl shadow-xl border overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b bg-muted/20">
              <div>
                <h2 className="text-xl font-bold">Solution Profile: {selectedStartup}</h2>
                <p className="text-sm text-muted-foreground">Proposed for {selectedChallenge}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowSolutionDetails(false)} className="rounded-full hover:bg-muted">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 overflow-auto space-y-8 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <FileText className="w-5 h-5" />
                    <h3>Executive Summary</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedStartup} proposes an innovative, scalable approach to address the requirements of the {selectedChallenge}. 
                    Their solution leverages state-of-the-art algorithms and robust hardware infrastructure to provide real-time monitoring, 
                    predictive analytics, and seamless integration with existing government systems.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Cpu className="w-5 h-5" />
                    <h3>Technical Architecture</h3>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                    <li>Cloud-native microservices architecture</li>
                    <li>Edge computing for low-latency processing</li>
                    <li>End-to-end military-grade encryption</li>
                    <li>Open APIs for easy interoperability</li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                  <Building className="w-5 h-5" />
                  <h3>Case Studies & Impact</h3>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg border text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Previous Deployment: Smart City Initiative 2023</p>
                  <p>Successfully deployed a scaled-down version of this system in 3 municipalities, resulting in a 40% reduction in operational costs and 99.9% system uptime over 12 months.</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                  <Clock className="w-5 h-5" />
                  <h3>Proposed Timeline</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[120px] bg-primary/5 border border-primary/20 p-3 rounded-lg text-center">
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Phase 1</div>
                    <div className="text-sm">Pilot Setup (2 mos)</div>
                  </div>
                  <div className="flex-1 min-w-[120px] bg-muted/50 border p-3 rounded-lg text-center">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Phase 2</div>
                    <div className="text-sm">Integration (3 mos)</div>
                  </div>
                  <div className="flex-1 min-w-[120px] bg-muted/50 border p-3 rounded-lg text-center">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Phase 3</div>
                    <div className="text-sm">State-wide Rollout</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-muted/10 flex justify-end">
              <Button onClick={() => setShowSolutionDetails(false)}>Close Details</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

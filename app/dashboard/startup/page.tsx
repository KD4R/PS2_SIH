"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const MOCK_CHALLENGES = [
  { title: "Smart City Waste Monitoring", dept: "Urban Affairs, Delhi", tag: "CivicTech", budget: "₹10L - ₹15L", fit: "You qualify" },
  { title: "Rural Health Kiosks Data Integration", dept: "Health Ministry, MP", tag: "HealthTech", budget: "₹5L - ₹8L", fit: "Check requirements" }
];

export default function StartupDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [appliedChallenges, setAppliedChallenges] = useState<number[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/">
            <h2 className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">GovProcure</h2>
          </Link>
          <p className="text-xs text-muted-foreground">Startup Innovator</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: "discover", label: "Discover challenges" },
            { id: "applications", label: "My applications" },
            { id: "pilots", label: "Active pilots" },
            { id: "payments", label: "Payments" },
            { id: "profile", label: "Profile & credibility" },
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
        <header className="h-16 border-b bg-card flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-lg font-semibold">Innovator Dashboard</h1>
          <div className="relative flex items-center gap-4">
            <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-600"></span> DPIIT Verified
            </span>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Profile Menu" 
              className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-medium flex items-center justify-center border border-indigo-300 hover:bg-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              ST
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-12 w-48 bg-card border rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">TechNova Inc.</p>
                  <p className="text-xs text-muted-foreground">Startup Innovator</p>
                </div>
                <Link href="/dashboard/startup/settings" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                  Settings
                </Link>
                <form action="/auth/signout" method="POST">
                  <button type="submit" className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors">
                    Log out
                  </button>
                </form>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8 space-y-8">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Matches (My sector)", value: "14" },
              { label: "Apps in review", value: "2" },
              { label: "Active pilots", value: "1" },
              { label: "Total received", value: "₹2.5L" },
            ].map((stat, i) => (
              <div key={i} className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 cursor-default">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-display font-bold mt-2 text-primary">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Conditional Tabs Content */}
              {activeTab === "discover" && (
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div className="px-6 py-4 border-b bg-muted/20 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Live Demand Radar</h3>
                    <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">Filter Results</Button>
                  </div>
                  <div className="p-6 space-y-4">
                    {MOCK_CHALLENGES.map((c, i) => (
                      <div key={i} className="border rounded-xl p-5 hover:border-primary/50 hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex gap-2 items-center mb-1">
                              <span className="text-xs font-medium px-2 py-0.5 bg-muted rounded text-muted-foreground">{c.tag}</span>
                              <span className="text-xs font-medium text-muted-foreground">{c.dept}</span>
                            </div>
                            <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{c.title}</h4>
                          </div>
                          {c.fit === "You qualify" ? 
                            <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium border border-green-200">✓ You qualify</span> :
                            <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium border border-amber-200">ℹ Check requirements</span>
                          }
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">Seeking innovative solutions to monitor and manage resources effectively with AI and IoT devices.</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="font-semibold text-sm">{c.budget}</span>
                          <Button 
                            size="sm" 
                            disabled={appliedChallenges.includes(i)}
                            onClick={() => setSelectedChallenge(i)}
                          >
                            {appliedChallenges.includes(i) ? "Applied" : "Apply Now"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "applications" && (
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="px-6 py-4 border-b bg-muted/20">
                    <h3 className="font-semibold text-lg">My applications</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-6 py-3.5 font-medium">Challenge</th>
                          <th className="px-6 py-3.5 font-medium">Department</th>
                          <th className="px-6 py-3.5 font-medium">Status</th>
                          <th className="px-6 py-3.5 font-medium">Next action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr className="hover:bg-muted/50 transition-colors cursor-pointer group">
                          <td className="px-6 py-4 font-medium group-hover:text-primary transition-colors">AI Traffic Management System</td>
                          <td className="px-6 py-4 text-muted-foreground">Department of Transport</td>
                          <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">Under review</span></td>
                          <td className="px-6 py-4 text-muted-foreground group-hover:translate-x-1 transition-transform">Wait for result</td>
                        </tr>
                        <tr className="hover:bg-muted/50 transition-colors cursor-pointer group">
                          <td className="px-6 py-4 font-medium group-hover:text-primary transition-colors">Smart Water Metering</td>
                          <td className="px-6 py-4 text-muted-foreground">Jal Shakti</td>
                          <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs bg-red-100 text-red-700 font-medium">Rejected</span></td>
                          <td className="px-6 py-4 text-muted-foreground group-hover:translate-x-1 transition-transform">None</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "pilots" && (
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="px-6 py-4 border-b bg-muted/20">
                    <h3 className="font-semibold text-lg">Active Pilots</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 p-4 border border-green-500/20 rounded-lg bg-green-500/10 hover:bg-green-500/20 hover:scale-[1.01] hover:shadow-sm transition-all duration-300 cursor-pointer">
                      <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-xl group-hover:scale-110 transition-transform">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-medium text-lg text-foreground">Water Quality Sensor Network</h4>
                        <p className="text-sm text-green-800 dark:text-green-300">Phase 2 Ongoing - In collaboration with Delhi Jal Board</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "payments" && (
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="px-6 py-4 border-b bg-muted/20">
                    <h3 className="font-semibold text-lg">Payments & Invoices</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 hover:shadow-sm hover:scale-[1.01] transition-all duration-300 cursor-pointer">
                      <div>
                        <h4 className="font-medium">Milestone 1: Hardware Setup</h4>
                        <p className="text-sm text-muted-foreground">Water Quality Pilot</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹1,00,000</p>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Paid - Aug 1</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 hover:shadow-sm hover:scale-[1.01] transition-all duration-300 cursor-pointer">
                      <div>
                        <h4 className="font-medium">Milestone 2: Data Dashboard</h4>
                        <p className="text-sm text-muted-foreground">Water Quality Pilot</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹50,000</p>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Processing</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="px-6 py-4 border-b bg-muted/20 flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Company Profile</h3>
                    <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">Edit Profile</Button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-2xl font-bold">
                        TN
                      </div>
                      <div>
                        <h4 className="font-bold text-xl">TechNova Innovations</h4>
                        <p className="text-sm text-muted-foreground">DPIIT Recognized Startup • Founded 2021</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 hover:border-primary/30 hover:bg-muted/20 transition-colors cursor-default">
                        <p className="text-sm text-muted-foreground mb-1">Sector</p>
                        <p className="font-medium">Smart Cities & IoT</p>
                      </div>
                      <div className="border rounded-lg p-4 hover:border-primary/30 hover:bg-muted/20 transition-colors cursor-default">
                        <p className="text-sm text-muted-foreground mb-1">Company Size</p>
                        <p className="font-medium">11-50 employees</p>
                      </div>
                      <div className="border rounded-lg p-4 hover:border-primary/30 hover:bg-muted/20 transition-colors cursor-default">
                        <p className="text-sm text-muted-foreground mb-1">Location</p>
                        <p className="font-medium">Bangalore, Karnataka</p>
                      </div>
                      <div className="border rounded-lg p-4 hover:border-primary/30 hover:bg-muted/20 transition-colors cursor-default">
                        <p className="text-sm text-muted-foreground mb-1">Website</p>
                        <p className="font-medium text-primary hover:underline cursor-pointer">technova.example.com</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">About</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        TechNova builds next-generation IoT sensors and data analytics platforms for municipal corporations. 
                        Our mission is to help Indian cities become smarter, cleaner, and more efficient through data-driven governance.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* Credibility score */}
              <div className="bg-gradient-to-br from-indigo-900 to-primary text-white rounded-xl shadow-lg p-6 relative overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                </div>
                <h3 className="font-semibold text-indigo-100">Credibility Score</h3>
                <div className="mt-4 flex items-end gap-3">
                  <span className="text-5xl font-bold tracking-tighter">84</span>
                  <span className="text-indigo-200 mb-1">/ 100</span>
                </div>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between items-center"><span className="text-indigo-100">Pilots Completed</span><span className="font-medium">1</span></div>
                  <div className="flex justify-between items-center"><span className="text-indigo-100">On-time Delivery</span><span className="font-medium">100%</span></div>
                </div>
                <div className="mt-6 bg-white/10 backdrop-blur rounded p-3 text-xs text-indigo-100">
                  Your score is portable across all government departments.
                </div>
              </div>

              {/* Milestone payment tracker */}
              <div className="bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="px-6 py-4 border-b bg-muted/20">
                  <h3 className="font-semibold">Milestone Tracker</h3>
                  <p className="text-xs text-muted-foreground mt-1">Water Quality Pilot</p>
                </div>
                <div className="p-6">
                  <div className="relative border-l-2 border-primary ml-3 space-y-6">
                    <div className="relative pl-6 group">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-primary/20 group-hover:scale-125 transition-transform duration-300"></div>
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors">Milestone 1: Hardware Setup</h4>
                      <p className="text-xs text-green-600 font-medium mt-1">₹1,00,000 Paid (Aug 1)</p>
                    </div>
                    <div className="relative pl-6 group">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-amber-500 ring-4 ring-amber-500/20 group-hover:scale-125 transition-transform duration-300"></div>
                      <h4 className="font-medium text-sm group-hover:text-amber-600 transition-colors">Milestone 2: Data Dashboard</h4>
                      <p className="text-xs text-amber-600 font-medium mt-1">Invoice Raised (Sep 20)</p>
                      <div className="text-xs text-muted-foreground mt-1">Pending verification by Gov Officer</div>
                    </div>
                    <div className="relative pl-6 group">
                      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-muted border-2 border-muted-foreground group-hover:border-primary transition-colors duration-300"></div>
                      <h4 className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">Milestone 3: Final Report</h4>
                      <p className="text-xs text-muted-foreground mt-1">₹50,000 Expected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Application Dialog */}
      <Dialog open={selectedChallenge !== null} onOpenChange={(open) => !open && setSelectedChallenge(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply for Challenge</DialogTitle>
            <DialogDescription>
              Submit your proposal for {selectedChallenge !== null ? MOCK_CHALLENGES[selectedChallenge].title : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="solution">How will you solve this?</Label>
              <Textarea
                id="solution"
                placeholder="Briefly describe your technical approach and methodology..."
                className="h-24 resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeline">Estimated Timeline & Cost</Label>
              <Input id="timeline" placeholder="e.g., 3 months for MVP, ₹8L estimated cost" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedChallenge(null)} disabled={isSubmittingApp}>Cancel</Button>
            <Button 
              disabled={isSubmittingApp}
              onClick={() => {
                if (selectedChallenge !== null) {
                  setIsSubmittingApp(true);
                  setTimeout(() => {
                    setAppliedChallenges(prev => [...prev, selectedChallenge]);
                    setIsSubmittingApp(false);
                    setSelectedChallenge(null);
                  }, 1000);
                }
              }}
            >
              {isSubmittingApp ? "Submitting..." : "Submit Proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

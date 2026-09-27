"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GovDashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("challenges");
  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/">
            <h2 className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">GovProcure</h2>
          </Link>
          <p className="text-xs text-muted-foreground">Department of Transport</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: "challenges", label: "My challenges" },
            { id: "post", label: "Post a challenge" },
            { id: "discovery", label: "Startup discovery" },
            { id: "pilots", label: "Pilots in progress" },
            { id: "templates", label: "Templates" },
            { id: "reports", label: "Reports" },
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

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-lg font-semibold">Department of Transport Dashboard</h1>
          <div className="relative flex items-center gap-4">
            <Button variant="outline" size="sm" className="hidden sm:flex">Notifications (2)</Button>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Profile Menu" 
              className="h-9 w-9 rounded-full bg-primary/20 text-primary font-medium flex items-center justify-center border border-primary/30 hover:bg-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              JD
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-12 w-48 bg-card border rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Department Officer</p>
                </div>
                <Link href="/dashboard/gov/settings" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
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
          {activeTab === "challenges" && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
                <Button className="shadow-md" onClick={() => setActiveTab("post")}>Post a new challenge</Button>
              </div>

          {/* Summary cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active challenges", value: "3" },
              { label: "Pilots running", value: "5" },
              { label: "Pilots completed", value: "12" },
              { label: "Avg. time-to-pilot", value: "45 days" },
            ].map((stat, i) => (
              <div key={i} className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 cursor-default">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-display font-bold mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Table: My open challenges */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="px-6 py-4 border-b bg-muted/20">
              <h3 className="font-semibold text-lg">My open challenges</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3.5 font-medium">Title</th>
                    <th className="px-6 py-3.5 font-medium">Status</th>
                    <th className="px-6 py-3.5 font-medium">Applicants</th>
                    <th className="px-6 py-3.5 font-medium">Deadline</th>
                    <th className="px-6 py-3.5 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-medium group-hover:text-primary transition-colors">AI Traffic Management System</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">Under review</span></td>
                    <td className="px-6 py-4">24</td>
                    <td className="px-6 py-4">Oct 15, 2026</td>
                    <td className="px-6 py-4"><Button variant="link" size="sm" className="p-0 h-auto group-hover:translate-x-1 transition-transform">View applicants</Button></td>
                  </tr>
                  <tr className="hover:bg-muted/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-medium group-hover:text-primary transition-colors">Water Quality Monitoring</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs bg-amber-100 text-amber-700 font-medium">Under review</span></td>
                    <td className="px-6 py-4">12</td>
                    <td className="px-6 py-4">Sep 10, 2026</td>
                    <td className="px-6 py-4"><Button variant="link" size="sm" className="p-0 h-auto group-hover:translate-x-1 transition-transform">Review shortlists</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Panel: Risk & compliance flags */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="px-6 py-4 border-b bg-muted/20 flex justify-between items-center">
                <h3 className="font-semibold">Risk & compliance flags</h3>
                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">2 Actions</span>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                  <div>
                    <p className="font-medium text-sm text-red-900">Water Quality Sensor Network</p>
                    <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500 inline-block"></span> Hardware deployment delayed
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-white dark:bg-card text-red-900 dark:text-red-400 hover:text-red-950 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-800 hover:scale-105 transition-all">Review</Button>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300">
                  <div>
                    <p className="font-medium text-sm text-amber-900">Smart Grid Monitor</p>
                    <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500 inline-block"></span> IP ambiguity flagged
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-white dark:bg-card text-amber-900 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 border-amber-200 dark:border-amber-800 hover:scale-105 transition-all">Review</Button>
                </div>
              </div>
            </div>

            {/* Panel: Pilot progress Kanban */}
            <div className="bg-card rounded-xl border shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="px-6 py-4 border-b bg-muted/20">
                <h3 className="font-semibold">Pilot Progress Overview</h3>
              </div>
              <div className="p-6 flex-1 bg-muted/5 overflow-x-auto">
                <div className="flex gap-3 min-w-max pb-2">
                  <div className="w-40 bg-muted/50 p-3 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors">
                    <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-3">Sandbox</p>
                    <div className="bg-card p-3 border rounded shadow-sm text-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
                      <p className="font-medium">Traffic AI</p>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '20%' }}></div></div>
                    </div>
                  </div>
                  <div className="w-40 bg-muted/50 p-3 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors">
                    <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-3">Live pilot</p>
                    <div className="bg-card p-3 border rounded shadow-sm text-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
                      <p className="font-medium">Water Sensors</p>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '40%' }}></div></div>
                    </div>
                  </div>
                  <div className="w-40 bg-muted/50 p-3 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors">
                    <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-3">Under review</p>
                    <div className="bg-card p-3 border rounded shadow-sm text-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
                      <p className="font-medium">AI Traffic Mgmt</p>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden"><div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '90%' }}></div></div>
                    </div>
                  </div>
                  <div className="w-40 bg-muted/50 p-3 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors">
                    <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider mb-3">Scale-ready</p>
                    <div className="bg-card p-3 border rounded shadow-sm text-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer">
                      <p className="font-medium">Health Kiosk</p>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </>
          )}

          {activeTab === "post" && (
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-8">
              <h3 className="text-2xl font-semibold mb-6">Post a New Challenge</h3>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Challenge Title</label>
                  <input type="text" className="w-full h-10 px-3 rounded-md border bg-background" placeholder="e.g. AI Traffic Management System" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <textarea className="w-full h-32 p-3 rounded-md border bg-background" placeholder="Describe the problem you need solved..."></textarea>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Budget Estimate</label>
                  <input type="text" className="w-full h-10 px-3 rounded-md border bg-background" placeholder="₹10L - ₹50L" />
                </div>
                <Button className="mt-4" onClick={() => setActiveTab("challenges")}>Publish Challenge</Button>
              </div>
            </div>
          )}

          {activeTab === "discovery" && (
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Startup Directory</h3>
              <p className="text-muted-foreground max-w-md mb-6">Browse and discover vetted startups across India matching your department's specific needs.</p>
              <Button onClick={() => setActiveTab("challenges")}>Back to Dashboard</Button>
            </div>
          )}

          {activeTab === "pilots" && (
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-8">
              <h3 className="text-2xl font-semibold mb-6">Active Pilots</h3>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">Water Quality Sensor Network</h4>
                    <p className="text-sm text-muted-foreground">Startup: AquaTech Solutions • Location: Delhi Jal Board</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">Phase 2 Ongoing</span>
                </div>
                <div className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">Smart Traffic AI</h4>
                    <p className="text-sm text-muted-foreground">Startup: TrafficVision • Location: Mumbai Traffic Police</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Sandbox Phase</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["RFP Template", "MOU Draft", "Pilot Agreement", "Evaluation Rubric"].map((doc, i) => (
                <div key={i} className="bg-card p-6 border rounded-xl shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">📄</div>
                    <span className="font-medium">{doc}</span>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2">Analytics & Reports</h3>
              <p className="text-muted-foreground max-w-md mb-6">Your procurement impact analytics, budget utilization, and startup engagement metrics will appear here.</p>
              <Button onClick={() => setActiveTab("challenges")}>View Overview</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

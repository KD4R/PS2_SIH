"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [validationQueue, setValidationQueue] = useState([
    { id: 1, name: "Traffic AI - Dept of Transport", status: "Nearing scale decision" },
    { id: 2, name: "Waste Mgmt - Urban Affairs", status: "Pilot completed" }
  ]);

  const [accessRequests, setAccessRequests] = useState([
    { id: 1, name: "Rajesh Kumar (Gov Officer)", details: "Health Ministry, verified domain" }
  ]);

  const [toastMessage, setToastMessage] = useState("");

  const handleAction = (type: string, id: number, list: string) => {
    if (list === "queue") {
      setValidationQueue(validationQueue.filter(item => item.id !== id));
      setToastMessage(`Validator assigned successfully.`);
    } else {
      setAccessRequests(accessRequests.filter(item => item.id !== id));
      setToastMessage(`User ${type}d successfully.`);
    }
    setTimeout(() => setToastMessage(""), 3000);
  };
  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/">
            <h2 className="text-xl font-bold text-white tracking-tight hover:opacity-80 transition-opacity">GovProcure<span className="text-primary">Admin</span></h2>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {[
            { label: "Cross-Dept Analytics", href: "/dashboard/admin" },
            { label: "Geospatial Map", href: "/dashboard/admin" },
            { label: "Validation Queue", href: "/dashboard/admin" },
            { label: "User Management", href: "/dashboard/admin" },
            { label: "System Logs", href: "/dashboard/admin" },
          ].map((item, idx) => (
            <Link key={item.label} href={item.href} className={`block px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${idx === 0 ? "bg-primary/20 text-white" : "hover:bg-slate-800 hover:text-white"}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-lg font-semibold">Program Administrator</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">Export Report</Button>
            <div className="h-9 w-9 rounded-full bg-slate-800 text-white font-medium flex items-center justify-center">AD</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8 space-y-8 relative">
          {toastMessage && (
            <div className="absolute top-4 right-4 bg-slate-800 text-white text-sm px-4 py-2 rounded-md font-medium shadow-lg animate-in fade-in slide-in-from-top-2 z-50">
              {toastMessage}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Analytics Summary */}
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">System-wide Pilot Success</p>
              <div className="flex items-end gap-3 mt-2">
                <p className="text-4xl font-display font-bold">68%</p>
                <span className="text-green-600 text-sm font-medium mb-1">+12% vs last yr</span>
              </div>
            </div>
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Avg Time-to-Pilot</p>
              <div className="flex items-end gap-3 mt-2">
                <p className="text-4xl font-display font-bold">42<span className="text-2xl text-muted-foreground ml-1">days</span></p>
                <span className="text-green-600 text-sm font-medium mb-1">-8 days</span>
              </div>
            </div>
            <div className="bg-card p-6 rounded-xl border shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Est. Procurement Savings</p>
              <div className="flex items-end gap-3 mt-2">
                <p className="text-4xl font-display font-bold text-green-700">₹4.2Cr</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map Placeholder */}
            <div className="bg-card border rounded-xl shadow-sm flex flex-col">
              <div className="px-6 py-4 border-b bg-muted/20">
                <h3 className="font-semibold">Geospatial Pilot Distribution</h3>
              </div>
              <div className="flex-1 p-6 flex flex-col items-center justify-center bg-muted/10 min-h-[300px] relative">
                {/* Mock map UI */}
                <div className="w-full h-full border-2 border-dashed border-border rounded-lg flex items-center justify-center relative overflow-hidden bg-slate-50">
                  <div className="absolute top-1/4 left-1/4 h-4 w-4 bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                  <div className="absolute top-1/2 left-1/2 h-4 w-4 bg-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)]"></div>
                  <div className="absolute bottom-1/3 right-1/3 h-4 w-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                  <span className="text-muted-foreground font-medium">Interactive Map View</span>
                </div>
                <div className="flex gap-4 mt-4 text-xs font-medium">
                  <span className="flex items-center gap-1"><span className="h-3 w-3 bg-blue-500 rounded-full"></span> Piloting</span>
                  <span className="flex items-center gap-1"><span className="h-3 w-3 bg-green-500 rounded-full"></span> Scaled</span>
                  <span className="flex items-center gap-1"><span className="h-3 w-3 bg-amber-500 rounded-full"></span> Stalled</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Validation Queue */}
              <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-muted/20 flex justify-between items-center">
                  <h3 className="font-semibold">Independent Validation Queue</h3>
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{validationQueue.length} Pending</span>
                </div>
                <div className="divide-y divide-border">
                  {validationQueue.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">Queue is empty</div>
                  ) : (
                    validationQueue.map(item => (
                      <div key={item.id} className="p-4 flex justify-between items-center hover:bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.status}</p>
                        </div>
                        <Button size="sm" onClick={() => handleAction("assign", item.id, "queue")}>Assign Validator</Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* User Management */}
              <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-muted/20 flex justify-between items-center">
                  <h3 className="font-semibold">User Access Requests</h3>
                </div>
                <div className="divide-y divide-border">
                  {accessRequests.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">No pending requests</div>
                  ) : (
                    accessRequests.map(item => (
                      <div key={item.id} className="p-4 flex justify-between items-center hover:bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.details}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction("reject", item.id, "access")}>Reject</Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction("approve", item.id, "access")}>Approve</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}

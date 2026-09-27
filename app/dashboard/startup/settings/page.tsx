"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StartupSettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "TechNova Inc.",
    dpiit: "DIPP12345",
    sector: "CivicTech, Mobility",
    teamSize: "15",
    years: "3",
    gem: "Not provided",
    pitch: "AI-driven traffic management and infrastructure mapping for modern smart cities."
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate network delay
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 1000);
  };
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
          {["My applications", "Discover challenges", "Saved challenges", "Active pilots"].map((item, idx) => (
            <a key={item} href="#" className={`block px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-muted hover:text-foreground`}>
              {item}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-lg font-semibold">Settings & Profile</h1>
          <div className="flex items-center gap-4">
            <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-600"></span> DPIIT Verified
            </span>
            <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-medium flex items-center justify-center border border-indigo-300">ST</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-2xl bg-card rounded-xl border shadow-sm p-8 relative">
            {isSaved && (
              <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-md font-medium border border-green-200 animate-in fade-in slide-in-from-top-2">
                ✓ Profile saved successfully
              </div>
            )}
            <h2 className="text-xl font-semibold mb-6">Startup Profile Details</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 border-b pb-4 items-center">
                <Label className="text-sm text-muted-foreground font-medium">Company / Startup Name</Label>
                <div className="col-span-2 text-sm font-medium">
                  {isEditing ? <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} /> : profile.name}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 border-b pb-4 items-center">
                <Label className="text-sm text-muted-foreground font-medium">DPIIT / Startup India No.</Label>
                <div className="col-span-2 text-sm flex items-center gap-2">
                  {isEditing ? <Input value={profile.dpiit} onChange={e => setProfile({...profile, dpiit: e.target.value})} /> : profile.dpiit}
                  {!isEditing && <span className="text-green-600 text-xs font-semibold">Verified ✓</span>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-b pb-4 items-center">
                <Label className="text-sm text-muted-foreground font-medium">Sector / Domain</Label>
                <div className="col-span-2 text-sm">
                  {isEditing ? <Input value={profile.sector} onChange={e => setProfile({...profile, sector: e.target.value})} /> : profile.sector}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-b pb-4 items-center">
                <Label className="text-sm text-muted-foreground font-medium">Team Size</Label>
                <div className="col-span-2 text-sm">
                  {isEditing ? <Input type="number" value={profile.teamSize} onChange={e => setProfile({...profile, teamSize: e.target.value})} /> : profile.teamSize}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-b pb-4 items-center">
                <Label className="text-sm text-muted-foreground font-medium">Years of Operation</Label>
                <div className="col-span-2 text-sm">
                  {isEditing ? <Input type="number" value={profile.years} onChange={e => setProfile({...profile, years: e.target.value})} /> : profile.years}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-b pb-4 items-center">
                <Label className="text-sm text-muted-foreground font-medium">GeM Registration</Label>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {isEditing ? <Input value={profile.gem} onChange={e => setProfile({...profile, gem: e.target.value})} placeholder="Optional" /> : profile.gem}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-b pb-4 items-center">
                <Label className="text-sm text-muted-foreground font-medium">Short Pitch</Label>
                <div className="col-span-2 text-sm">
                  {isEditing ? <Input value={profile.pitch} onChange={e => setProfile({...profile, pitch: e.target.value})} /> : profile.pitch}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/dashboard/startup">
                    <Button variant="outline">Back to Dashboard</Button>
                  </Link>
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

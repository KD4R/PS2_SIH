"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GovSettingsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [profile, setProfile] = useState({
    department: "Ministry of Urban Affairs",
    email: "rahul.sharma@mohua.gov.in",
    designation: "Joint Secretary",
    sector: "CivicTech, Infrastructure",
    phone: "+91 98765 43210"
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
          <p className="text-xs text-muted-foreground">Department Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {["My challenges", "Post a challenge", "Startup discovery", "Pilots in progress", "Templates", "Reports"].map((item, idx) => (
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
            <div className="h-9 w-9 rounded-full bg-primary/20 text-primary font-medium flex items-center justify-center border border-primary/30">JD</div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-2xl bg-card rounded-xl border shadow-sm p-8 relative">
            {isSaved && (
              <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-md font-medium border border-green-200 animate-in fade-in slide-in-from-top-2">
                ✓ Profile saved successfully
              </div>
            )}
            <h2 className="text-xl font-semibold mb-6">Profile Details</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 border-b pb-4 items-center">
                <Label className="text-sm text-muted-foreground font-medium">Department / Agency Name</Label>
                <div className="col-span-2 text-sm font-medium">
                  {isEditing ? <Input value={profile.department} onChange={e => setProfile({...profile, department: e.target.value})} /> : profile.department}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 border-b pb-4 items-center">
                <Label className="text-sm text-muted-foreground font-medium">Official Government Email</Label>
                <div className="col-span-2 text-sm">
                  {isEditing ? <Input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} /> : profile.email}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-b pb-4 items-center">
                <Label className="text-sm text-muted-foreground font-medium">Designation / Title</Label>
                <div className="col-span-2 text-sm">
                  {isEditing ? <Input value={profile.designation} onChange={e => setProfile({...profile, designation: e.target.value})} /> : profile.designation}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-b pb-4 items-center">
                <Label className="text-sm text-muted-foreground font-medium">Department Sector</Label>
                <div className="col-span-2 text-sm">
                  {isEditing ? <Input value={profile.sector} onChange={e => setProfile({...profile, sector: e.target.value})} /> : profile.sector}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-b pb-4 items-center">
                <Label className="text-sm text-muted-foreground font-medium">Contact Number</Label>
                <div className="col-span-2 text-sm">
                  {isEditing ? <Input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} /> : profile.phone}
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
                  <Link href="/dashboard/gov">
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

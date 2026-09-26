"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function PilotDashboardClient({
  proposalId,
  role,
  status,
  initialKpis,
  initialEvidence,
  initialObservations,
  initialValidations
}: {
  proposalId: string;
  role: string;
  status: string;
  initialKpis: any[];
  initialEvidence: any[];
  initialObservations: any[];
  initialValidations: any[];
}) {
  const [kpis, setKpis] = useState(initialKpis);
  const [evidence, setEvidence] = useState(initialEvidence);
  const [observations, setObservations] = useState(initialObservations);
  const [validations, setValidations] = useState(initialValidations);

  // Form states
  const [kpiName, setKpiName] = useState("");
  const [kpiDesc, setKpiDesc] = useState("");
  const [kpiUnit, setKpiUnit] = useState("");
  const [kpiTarget, setKpiTarget] = useState("");
  
  const [obsValue, setObsValue] = useState("");
  const [obsKpi, setObsKpi] = useState("");
  
  const [valStatus, setValStatus] = useState("verified");
  const [valNotes, setValNotes] = useState("");
  const [valKpi, setValKpi] = useState("");

  const handleAddKpi = async () => {
    if (!kpiName || !kpiTarget) return;
    const newKpi = {
      name: kpiName,
      description: kpiDesc,
      unit: kpiUnit,
      direction: "higher_is_better",
      baselineValue: 0,
      targetValue: parseFloat(kpiTarget),
      source: "officer_defined"
    };

    const res = await fetch(`/api/proposals/${proposalId}/kpis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kpis: [newKpi] })
    });
    
    if (res.ok) {
      alert("KPI Added. Please refresh to see it.");
      setKpiName(""); setKpiDesc(""); setKpiTarget(""); setKpiUnit("");
    } else {
      alert("Error adding KPI");
    }
  };

  const handleRecordObservation = async () => {
    if (!obsKpi || !obsValue) return;
    
    const res = await fetch(`/api/proposals/${proposalId}/observations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kpiId: obsKpi, observedValue: parseFloat(obsValue) })
    });
    
    if (res.ok) {
      alert("Observation Recorded. Please refresh.");
      setObsValue(""); setObsKpi("");
    }
  };

  const handleUploadEvidence = async () => {
    const title = prompt("Evidence Title:");
    if (!title) return;
    const url = prompt("Evidence URL (e.g., https://link-to-report):");
    
    const res = await fetch(`/api/proposals/${proposalId}/evidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, evidenceType: "other", externalUrl: url || "" })
    });
    
    if (res.ok) {
      alert("Evidence Uploaded. Please refresh.");
    }
  };

  const handleRecordValidation = async () => {
    if (!valKpi || !valStatus) return;
    
    const res = await fetch(`/api/proposals/${proposalId}/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kpiId: valKpi, status: valStatus, notes: valNotes })
    });
    
    if (res.ok) {
      alert("Validation Recorded. Please refresh.");
      setValKpi(""); setValNotes("");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* KPIs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pilot KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          {kpis.length === 0 ? <p className="text-sm text-muted-foreground">No KPIs defined yet.</p> : (
            <div className="grid gap-4 md:grid-cols-2">
              {kpis.map(k => (
                <div key={k.id} className="border p-4 rounded bg-muted/20">
                  <div className="font-semibold">{k.name}</div>
                  <div className="text-xs text-muted-foreground">{k.description}</div>
                  <div className="mt-2 text-sm">Target: {k.target_value} {k.unit}</div>
                  
                  {/* Show Observations */}
                  <div className="mt-2 text-xs">
                    <strong>Observations:</strong>
                    {observations.filter(o => o.kpi_id === k.id).map(o => (
                      <div key={o.id} className="text-blue-600 border-l-2 border-blue-200 pl-2 mt-1">
                        Value: {o.observed_value} ({new Date(o.observed_at).toLocaleDateString()})
                      </div>
                    ))}
                  </div>

                  {/* Show Validations */}
                  <div className="mt-2 text-xs">
                    <strong>Validation:</strong>
                    {validations.filter(v => v.kpi_id === k.id).map(v => (
                      <div key={v.id} className="text-purple-600 border-l-2 border-purple-200 pl-2 mt-1">
                        {v.status.toUpperCase()} - {v.notes}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add KPI (Officer only) */}
          {(role === "department_officer" || role === "platform_admin") && status === "pilot_active" && (
            <div className="mt-6 border-t pt-4 space-y-3">
              <h4 className="text-sm font-semibold">Define New KPI</h4>
              <div className="flex gap-2">
                <Input placeholder="KPI Name" value={kpiName} onChange={e => setKpiName(e.target.value)} />
                <Input placeholder="Target Value" type="number" value={kpiTarget} onChange={e => setKpiTarget(e.target.value)} />
                <Input placeholder="Unit" value={kpiUnit} onChange={e => setKpiUnit(e.target.value)} />
              </div>
              <Input placeholder="Description" value={kpiDesc} onChange={e => setKpiDesc(e.target.value)} />
              <Button onClick={handleAddKpi}>Add KPI</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Startup Actions */}
      {role === "startup_founder" && status === "pilot_active" && (
        <Card>
          <CardHeader><CardTitle>Startup Actions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded space-y-3">
              <h4 className="text-sm font-semibold">Record KPI Observation</h4>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                      value={obsKpi} onChange={e => setObsKpi(e.target.value)}>
                <option value="">Select KPI...</option>
                {kpis.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
              <Input placeholder="Observed Value" type="number" value={obsValue} onChange={e => setObsValue(e.target.value)} />
              <Button onClick={handleRecordObservation}>Submit Observation</Button>
            </div>
            
            <div className="p-4 border rounded space-y-3">
              <h4 className="text-sm font-semibold">Upload Evidence</h4>
              <Button variant="outline" onClick={handleUploadEvidence}>Upload Document / Link</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Evidence Viewer */}
      <Card>
        <CardHeader><CardTitle>Pilot Evidence Log</CardTitle></CardHeader>
        <CardContent>
          {evidence.length === 0 ? <p className="text-sm text-muted-foreground">No evidence uploaded yet.</p> : (
            <div className="space-y-2">
              {evidence.map(e => (
                <div key={e.id} className="p-3 border rounded text-sm flex justify-between">
                  <div>
                    <span className="font-semibold">{e.title}</span> ({e.evidence_type})
                  </div>
                  {e.external_url && <a href={e.external_url} target="_blank" className="text-blue-500 hover:underline">View</a>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Independent Validator Dashboard */}
      {role === "validator" && (status === "validation" || status === "pilot_active") && (
        <Card className="border-purple-200">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-purple-800">Independent Validator Action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
            <p className="text-sm">Review the KPIs, Observations, and Evidence above, then issue a verdict.</p>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                    value={valKpi} onChange={e => setValKpi(e.target.value)}>
              <option value="">Select KPI to Validate...</option>
              {kpis.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
            
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                    value={valStatus} onChange={e => setValStatus(e.target.value)}>
              <option value="verified">Verified</option>
              <option value="partially_verified">Partially Verified</option>
              <option value="insufficient_evidence">Insufficient Evidence</option>
              <option value="not_verified">Not Verified (Failed)</option>
            </select>

            <Input placeholder="Validation Notes / Justification" value={valNotes} onChange={e => setValNotes(e.target.value)} />
            <Button onClick={handleRecordValidation} className="bg-purple-600 hover:bg-purple-700 text-white">Record Verification</Button>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

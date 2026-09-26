"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import jsPDF from "jspdf";
import { useState } from "react";

export function ContractGenerator({ startupName }: { startupName: string }) {
  const [generating, setGenerating] = useState(false);

  const generateStandardPilotAgreement = () => {
    setGenerating(true);
    try {
      const doc = new jsPDF();
      
      const margin = 20;
      let y = 20;

      // Helper to add text and update Y position
      const addText = (text: string, size: number, isBold: boolean = false, increment: number = 10) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        
        // Handle text wrapping
        const lines = doc.splitTextToSize(text, 170);
        
        // Check page overflow
        if (y + (lines.length * increment) > 280) {
          doc.addPage();
          y = 20;
        }
        
        doc.text(lines, margin, y);
        y += lines.length * increment;
      };

      // Header
      addText("GOVERNMENT-STARTUP PILOT AGREEMENT", 18, true, 15);
      
      // Parties
      addText(`This Pilot Agreement is made between the Government Procuring Entity and ${startupName}.`, 12, false, 15);

      // Section 1: Data/IP Clauses
      addText("1. Data / IP Clauses", 14, true, 12);
      addText("1.1. All data generated during the pilot phase shall remain the sovereign property of the Government Entity.", 11, false, 8);
      addText("1.2. The Startup retains the core Intellectual Property (IP) of the underlying technology.", 11, false, 15);

      // Section 2: Cybersecurity Requirements
      addText("2. Cybersecurity Requirements", 14, true, 12);
      addText("2.1. The Startup shall ensure compliance with the latest CERT-In guidelines.", 11, false, 8);
      addText("2.2. All government data must be encrypted at rest and in transit.", 11, false, 8);
      addText("2.3. A mandatory security audit shall be conducted prior to scale-up deployment.", 11, false, 15);

      // Section 3: Milestone-Based Payment Terms
      addText("3. Milestone-Based Payment Terms", 14, true, 12);
      addText("3.1. Advance Payment: 20% upon signing this pilot agreement.", 11, false, 8);
      addText("3.2. Mid-Pilot Review: 30% upon successful demonstration of core functionality.", 11, false, 8);
      addText("3.3. Final Handover: 50% upon successful completion of the pilot and submission of the final evaluation report.", 11, false, 20);

      // Signatures
      addText("_________________________", 12, false, 8);
      addText("For Government Entity", 10, true, 25);
      
      addText("_________________________", 12, false, 8);
      addText(`For ${startupName}`, 10, true, 15);

      // Save PDF
      doc.save(`Pilot_Agreement_${startupName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="w-full text-xs" 
      onClick={generateStandardPilotAgreement}
      disabled={generating}
    >
      <FileText className="w-4 h-4 mr-2" />
      {generating ? "Generating..." : "Generate Pilot Agreement"}
    </Button>
  );
}

# The Master Frontend PRD (Kedar)

## 🚀 The Mission
Siddharth has completely fortified the backend. It now includes Deep-Tech AI analysis, Budget Fraud detection, Bhashini translation, XSS sanitization, and a Financial Kill Switch. 
**Your job is to build the UI to showcase these super-features to the judges.**

---

## Task 1: The "Anti-Fraud" Verdict UI
The AI Verdict now catches startups trying to fake deep-tech or inflate budgets.
*   **What to do:** In `features/procurement-pipeline/components/ai-report-modal.tsx`, the `verdict` JSON now returns two new fields: `fraudRiskLevel` ("LOW" | "MEDIUM" | "HIGH") and `deepTechAnalysis` (string).
*   **The UI:** If `fraudRiskLevel === "HIGH"`, you MUST display a massive, flashing red banner at the top of the AI Report Modal: 
    > **🚨 SEVERE FRAUD RISK DETECTED**
    > *AI GitHub Audit:* {deepTechAnalysis}
*   **Why it wins:** Judges will go crazy when they see the AI actively catching a startup trying to scam the government.

---

## Task 2: The "Reverse Pitch" Auto-Generator (WOW Factor)
Instead of officers typing challenges, we want the AI to read citizen complaints and write the challenge for them.
*   **What to do:** On the Officer's "Create Challenge" page, add a button that says `[ ✨ Auto-Generate from Grievances ]`.
*   **The UI:** Clicking it opens a modal with a textarea: "Paste Public Grievance Data". When they hit submit, call `POST /api/challenges/auto-generate` with `{ "grievanceData": "..." }`.
*   **The Result:** Take the structured JSON returned by the backend and instantly auto-fill the Create Challenge form. 

---

## Task 3: The Financial Kill Switch
We need to prove to the judges that we handle Risk Management when pilots fail.
*   **What to do:** On the Kanban Pipeline board, under the **"Pilot Active"** column, add a bold red button: `[ 🛑 HALT PILOT (Kill Switch) ]`.
*   **The UI:** Clicking it opens a small dialog asking for a "Reason for Termination". 
*   **The Action:** Submit the reason to `POST /api/proposals/[id]/kill-switch`. If successful, show a Toast message saying "Funds Frozen. Legal Notice Generated." and reload the board (the proposal will vanish to the rejected column).

---

## Task 4: Startup DPIIT Verification (The Fast-Track)
*   **What to do:** On the Startup's dashboard or profile page, add an input field: `Enter DPIIT Number`. 
*   **The UI:** Add helper text for the judges: *(Hint: Enter any number starting with DIPP, e.g., DIPP12345, to simulate a successful API verification)*.
*   **The Action:** Submit to `POST /api/dpiit/verify`. When it returns success, show a highly satisfying green `[✓ DPIIT Verified]` badge permanently on their profile.

---

## Task 5: Mock WhatsApp & Razorpay (The Polish)
*   **Razorpay:** When the officer clicks "Approve Payment" on a milestone, before you call the API, show a 2-second fake loading modal that looks like Razorpay or a Bank Transfer (e.g., "Transferring ₹5,00,000 via NEFT...").
*   **WhatsApp:** Build a simple fixed `<div>` on the bottom right of the screen that looks like a phone. When a pilot is approved, make a CSS animation slide up a green WhatsApp bubble: *"Govt of Maharashtra: Your pilot is approved!"*

---
*Follow this PRD exactly, and the platform will look like a multi-million dollar, state-of-the-art Government system.*

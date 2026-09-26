# PRD: Backend & AI Engine (Siddharth)

## Overview
Your goal is to build the core logic that makes this platform legally compliant, secure, and integrated with the Indian Government ecosystem. You are building the "Brain" and the "Bridge".

## Core Features to Implement

### 1. Dynamic AI Smart Contracts (The "Perfect Contract" Engine)
**Problem:** Government contracts are rigid. Startup pilots require agile IP, data, and exit clauses.
**Solution:**
*   Create an API route `POST /api/proposals/[id]/contract`.
*   Fetch the proposal, the challenge, and the **AI Verdict** (which contains the identified risks).
*   Use Groq (LLM) to generate a customized Pilot Agreement.
*   **Crucial Instruction to AI:** If the AI Verdict flagged "Data Privacy", inject DPDP Act 2023 clauses. If it flagged "Vendor Lock-in", inject Open Source/Code Escrow clauses.
*   *Output:* A beautifully formatted Markdown contract.

### 2. DPIIT Fast-Track & Waiver Engine
**Problem:** Startups get disqualified due to "Prior Turnover" and "Years of Experience" rules in standard government tenders.
**Solution:**
*   Create a mock API `/api/dpiit/verify`.
*   Accept a DPIIT Registration Number (e.g., `DIPP12345`).
*   Return a mock verification payload.
*   **The Magic:** When a startup submits a proposal with a verified DPIIT number, the backend should automatically attach a "Turnover Waiver Applied (Startup India Sandbox Policy)" flag to the database.

### 3. The GeM (Government e-Marketplace) Bridge
**Problem:** Once a pilot succeeds, scaling it requires a fresh, 6-month tendering process.
**Solution:**
*   Create a `POST /api/proposals/[id]/scale` endpoint.
*   When the officer clicks "Scale Solution", this endpoint takes the successful pilot data and generates a mock `GeM_Listing_Schema.json`.
*   This schema defines how the startup's product will be listed on GeM under a "Custom Innovation Category", allowing other departments to buy it directly without a tender.

## Tech Stack
*   Next.js API Routes (Serverless)
*   Supabase (PostgreSQL, Edge Functions if needed)
*   Groq API (Llama 3 / OSS Models) for Contract Generation

## Implementation Steps
1.  **DB Updates:** Add `dpiit_number` and `dpiit_verified` to the `profiles` table. Add `contract_text` to the `procurement_proposals` table.
2.  **API 1:** Build the DPIIT verification mock route.
3.  **API 2:** Build the AI Contract Generator route. Use a very strict system prompt to ensure it generates legal-sounding clauses (IP Rights, Indemnity, Data Localization).
4.  **API 3:** Build the GeM export route.

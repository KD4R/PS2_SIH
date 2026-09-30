# GovProcure AI

Startup-friendly public procurement, end to end: a government department
publishes an outcome-focused challenge, DPIIT-recognised startups bid,
an AI-assisted evaluation recommends a winner, the winner runs a paid
pilot with milestone-linked payments, and successful pilots are validated
and scaled to more districts.

Built for Problem Statement **SIH 26136**. The frontend is fully
self-contained: it runs on sample data with **no backend, no API keys and
no Supabase project required**.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and click **Get started**. Pick a role on the
login screen (each role lands on its own dashboard):

| Role | Home | What you can do there |
| --- | --- | --- |
| Government (Delhi Jal Board) | `/dashboard/gov` | Browse the marketplace, run eligibility checks, publish a challenge (6-step wizard with templates), review proposals with the AI evaluation board, approve a pilot, verify evidence and release milestone payments, decide scale-up |
| Startup (TechNova Innovations) | `/dashboard/startup` | Discover challenges, check eligibility, submit proposals, upload milestone evidence, track KPIs and payments |
| Evaluator | `/dashboard/evaluator` | Score shortlisted proposals on weighted criteria |
| Program Administrator | `/dashboard/admin` | Assign validators, complete compliance validation, review the audit log and access requests |

A consistent walkthrough story ships in the seed data: the
**Water Quality Sensor Network** challenge (₹10–15L, 6 months, detect
contamination within 6 hours across 40 monitoring points), won by
**TechNova Innovations**, now mid-pilot on `pil-water` with milestone M1
paid, M2 evidence under review and M3 pending.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page with the procurement pathway |
| `/public` | Public portal: impact counters, scaled solutions, innovation directory |
| `/dashboard/templates` | Reusable challenge, evaluation and pilot-agreement templates (preview, use, PDF) |
| `/dashboard/gov/*` | Officer flows: marketplace, new-challenge wizard, proposal decision, pilot cockpit, scale-up |
| `/dashboard/startup/*` | Founder flows: challenges, proposal submission, pilot progress, evidence upload |
| `/dashboard/evaluator` | Weighted scoring for shortlisted proposals |
| `/dashboard/admin` | Validation, access requests, audit log |
| `/about` | How the pathway works |

## Scripts

```bash
npm run dev          # start the dev server
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run check:data   # guard: seed story consistency + banned-copy check
npm run lint         # eslint
```

## Sample data notice

All screens run on illustrative data stored in the browser. Statements
about rules (GFR, DPIIT relaxations, GeM/CppP integrations) are mock copy —
verify rule wording against current guidelines before real use. There is
no live backend; every button produces a visible, local effect.

The legacy AI board, API routes and server modules under `lib/server`,
`lib/ai` and `app/api` are unused by these flows and are kept only as
reference code.

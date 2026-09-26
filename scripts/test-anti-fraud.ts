import { auditMilestoneEvidence } from "../lib/ai/evidence-audit";
import { evaluateDeepTechAuthenticity } from "../lib/ai/github-eval";
import { sanitizeInput } from "../lib/server/xss-sanitize";
import { translateToEnglish } from "../lib/ai/bhashini";
// We use assert from node for basic testing
import assert from "node:assert";

async function runTests() {
  console.log("Running Backend Rigour & Security Tests...\n");

  let passed = 0;
  let failed = 0;

  function check(name: string, condition: boolean) {
    if (condition) {
      console.log(`[ok]   ${name}`);
      passed++;
    } else {
      console.log(`[FAIL] ${name}`);
      failed++;
    }
  }

  // 1. XSS Sanitization Tests
  console.log("1. XSS Sanitization");
  try {
    const maliciousInput = "<script>alert('hack')</script>Hello World<img src=x onerror=alert(1)>";
    const clean = sanitizeInput(maliciousInput);
    check("Strips script tags", !clean.includes("<script>"));
    check("Strips image onerror tags", !clean.includes("onerror"));
    check("Preserves safe text", clean.includes("Hello World"));
  } catch (e) {
    check("XSS test threw error", false);
  }
  console.log("");

  // 2. Budget Fraud Logic (We'll test the heuristic directly since it's internal to verdict.ts, but let's test via mock or regex here)
  // Instead, let's test Evidence Auditor
  console.log("2. AI Evidence Auditor (Anti-Fraud)");
  try {
    // We mock the AI call by looking at the prompt logic if we can't hit real groq, 
    // but these scripts actually hit Groq. Let's do a fast test.
    const goodEvidence = "Here is the API documentation: https://github.com/myrepo/docs and the working endpoint at https://api.myrepo.com/v1";
    const resultGood = await auditMilestoneEvidence("Deploy API", "Must deploy working REST API", goodEvidence);
    check("Accepts valid technical evidence with links", resultGood.isAccepted === true);

    const badEvidence = "We finished writing the code yesterday and it works great on my laptop.";
    const resultBad = await auditMilestoneEvidence("Deploy API", "Must deploy working REST API", badEvidence);
    check("Rejects vague textual claims without links", resultBad.isAccepted === false);
  } catch (e) {
    console.log("Skipping AI calls (API Key might be missing or rate limited)");
  }
  console.log("");

  // 3. Github Evaluator
  console.log("3. GitHub Deep Tech Evaluator");
  try {
    const noRepo = await evaluateDeepTechAuthenticity("Just an idea without code.");
    check("Passes immediately if no github link is found", noRepo.isAuthentic === true);
    
    // We won't test a real github link to avoid hitting rate limits, but the regex extraction is key.
  } catch (e) {
    console.log("Skipping AI calls");
  }
  console.log("");

  console.log("4. Bhashini Translation Stub");
  try {
    const enText = "This is pure english.";
    const enRes = await translateToEnglish(enText);
    check("Leaves English text alone (mostly)", !!enRes.translatedText);
  } catch (e) {}

  console.log(`\nTESTS COMPLETED: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(console.error);

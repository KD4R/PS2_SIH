"use client";

import { useDemoStore } from "./store";

export type Lang = "en" | "hi" | "mr";

type Entry = { en: string; hi: string; mr: string };

/** ~40 UI strings. Falls back to English for any missing key. */
const dict: Record<string, Entry> = {
  "nav.overview": { en: "Overview", hi: "अवलोकन", mr: "आढावा" },
  "nav.challenges": { en: "Challenges", hi: "चुनौतियाँ", mr: "स्पर्धा" },
  "nav.proposals": { en: "Proposals", hi: "प्रस्ताव", mr: "प्रस्ताव" },
  "nav.pilots": { en: "Pilots", hi: "पायलट", mr: "पायलट" },
  "nav.startups": { en: "Startup Directory", hi: "स्टार्टअप निर्देशिका", mr: "स्टार्टअप नोंदणी" },
  "nav.templates": { en: "Templates", hi: "टेम्पलेट", mr: "टेमप्लेट्स" },
  "nav.analytics": { en: "Analytics", hi: "विश्लेषण", mr: "विश्लेषण" },
  "nav.demand": { en: "Demand Radar", hi: "माँग रडार", mr: "मागणी रडार" },
  "nav.applications": { en: "My Applications", hi: "मेरे आवेदन", mr: "माझे अर्ज" },
  "nav.payments": { en: "Pilots & Payments", hi: "पायलट और भुगतान", mr: "पायलट व पेमेंट" },
  "nav.profile": { en: "Company Profile", hi: "कंपनी प्रोफ़ाइल", mr: "कंपनी प्रोफाइल" },
  "nav.pending": { en: "Pending Evaluations", hi: "लंबित मूल्यांकन", mr: "प्रलंबित मूल्यांकन" },
  "nav.completed": { en: "Completed", hi: "पूर्ण", mr: "पूर्ण" },
  "nav.settings": { en: "Settings", hi: "सेटिंग्स", mr: "सेटिंग्ज" },
  "nav.validation": { en: "Validation Queue", hi: "सत्यापन कतार", mr: "पडताळणी रांग" },
  "nav.access": { en: "Access Requests", hi: "पहुँच अनुरोध", mr: "प्रवेश विनंत्या" },
  "nav.audit": { en: "Audit Log", hi: "ऑडिट लॉग", mr: "ऑडिट नोंदी" },
  "common.approve": { en: "Approve", hi: "स्वीकृत करें", mr: "मंजूर करा" },
  "common.reject": { en: "Reject", hi: "अस्वीकृत करें", mr: "नाकारा" },
  "common.submit": { en: "Submit", hi: "जमा करें", mr: "सबमिट करा" },
  "common.cancel": { en: "Cancel", hi: "रद्द करें", mr: "रद्द करा" },
  "common.search": { en: "Search", hi: "खोजें", mr: "शोधा" },
  "common.viewDetails": { en: "View details", hi: "विवरण देखें", mr: "तपशील पहा" },
  "common.upload": { en: "Upload evidence", hi: "साक्ष्य अपलोड करें", mr: "पुरावा अपलोड करा" },
  "common.release": { en: "Release payment", hi: "भुगतान जारी करें", mr: "पेमेंट जारी करा" },
  "dashboard.welcome": { en: "Welcome back", hi: "आपका स्वागत है", mr: "पुन्हा स्वागत आहे" },
  "dashboard.openChallenges": { en: "Open Challenges", hi: "खुली चुनौतियाँ", mr: "खुल्या स्पर्धा" },
  "dashboard.activePilots": { en: "Active Pilots", hi: "सक्रिय पायलट", mr: "सक्रिय पायलट" },
  "dashboard.pendingPayments": { en: "Pending Payments", hi: "लंबित भुगतान", mr: "प्रलंबित पेमेंट" },
  "dashboard.totalAwarded": { en: "Total Value Awarded", hi: "कुल सौंपा गया मूल्य", mr: "एकूण मंजूर मूल्य" },
  "status.submitted": { en: "Submitted", hi: "जमा", mr: "सादर" },
  "status.evaluating": { en: "Evaluating", hi: "मूल्यांकन", mr: "मूल्यांकन" },
  "status.evaluated": { en: "Evaluated", hi: "मूल्यांकित", mr: "मूल्यांकित" },
  "status.approved": { en: "Approved", hi: "स्वीकृत", mr: "मंजूर" },
  "status.rejected": { en: "Rejected", hi: "अस्वीकृत", mr: "नाकारले" },
  "public.title": { en: "Public Transparency Portal", hi: "जनता पारदर्शिता पोर्टल", mr: "जनता पारदर्शक पोर्टल" },
  "hero.title": { en: "Startup-friendly public procurement", hi: "स्टार्टअप-अनुकूल सार्वजनिक खरीद", mr: "स्टार्टअप-अनुकूल सार्वजनिक खरेदी" },
  "nav.post": { en: "Post a challenge", hi: "चुनौती पोस्ट करें", mr: "स्पर्धा पोस्ट करा" },
  "nav.demand.title": { en: "Live Demand Radar", hi: "लाइव माँग रडार", mr: "थेट मागणी रडार" },
  "demand.title": { en: "Live demand radar", hi: "लाइव माँग रडार", mr: "थेट मागणी रडार" },
  "common.approveRelease": { en: "Approve & release payment", hi: "स्वीकृत करें और भुगतान जारी करें", mr: "मंजूर करा व पेमेंट जारी करा" },
  "status.evidence": { en: "Evidence submitted", hi: "साक्ष्य जमा", mr: "पुरावा सादर" },
};

/** Returns a translate function bound to the current language. */
export function useT() {
  const lang = useDemoStore((s) => s.lang);
  return (key: string): string => {
    const entry = dict[key];
    if (!entry) return key;
    return entry[lang] ?? entry.en;
  };
}

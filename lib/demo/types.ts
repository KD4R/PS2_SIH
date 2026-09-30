export type Role = "startup" | "gov" | "evaluator" | "admin";

export type ProposalStatus =
  | "Submitted"
  | "Evaluating"
  | "Evaluated"
  | "Approved"
  | "Active Pilot"
  | "Rejected";

export type PilotStatus =
  | "Contract Signed"
  | "In Progress"
  | "Pilot Completed"
  | "In Validation"
  | "Validated"
  | "Scaled"
  | "Closed";

export type MilestoneStatus =
  | "Pending"
  | "Evidence Submitted"
  | "Verified"
  | "Payment Released"
  | "Rejected";

export interface Challenge {
  id: string;
  title: string;
  department: string;
  domain: string;
  district: string;
  problemStatement: string;
  outcomeStatement: string;
  budgetMin: number;
  budgetMax: number;
  durationMonths: number;
  deadline: string;
  eligibility: string[];
  templateIds: string[];
  status: "Open" | "Closed";
}

export interface Startup {
  id: string;
  name: string;
  founder: string;
  sector: string;
  stage: string;
  dpiitNo: string;
  dpiitVerified: boolean;
  incorporatedYear: number;
  turnoverBand: string;
  pastPilots: number;
  credibility: number;
}

export interface EvaluationScore {
  criterion: string;
  score: number;
  weight: number;
}

export interface Evaluation {
  scores: EvaluationScore[];
  total: number;
  verdict: "Recommend" | "Conditional" | "Not Recommended";
  agentNotes: { agent: string; note: string }[];
  evaluatorScores?: Record<string, number>;
}

export interface Proposal {
  id: string;
  challengeId: string;
  startupId: string;
  summary: string;
  costEstimate: number;
  timelineMonths: number;
  status: ProposalStatus;
  fitScore: number;
  evaluation?: Evaluation;
  submittedAt: string;
}

export interface Milestone {
  id: string;
  pilotId: string;
  title: string;
  kpi: string;
  paymentPct: number;
  amount: number;
  dueDate: string;
  status: MilestoneStatus;
  evidenceName?: string;
  releasedOn?: string;
}

export interface KpiPoint {
  label: string;
  baseline: number;
  target: number;
  actual: number;
  unit: string;
  lowerIsBetter?: boolean;
}

export interface Risk {
  id: string;
  title: string;
  likelihood: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  mitigation: string;
  owner: string;
}

export interface SandboxScope {
  area: string;
  durationWeeks: number;
  budgetCap: number;
  exitCriteria: string[];
  killSwitchActive: boolean;
}

export interface ComplianceState {
  dataResidency: "India";
  ipClause: string;
  vaptDone: boolean;
  dsaSigned: boolean;
  incidentContact: string;
  score: number;
}

export interface Validation {
  validator?: string;
  status: "Queued" | "Assigned" | "Completed";
  findings?: string[];
  result?: "Pass" | "Pass with conditions" | "Fail";
  date?: string;
}

export interface ScaleDecision {
  outcome: "Scale" | "Convert to procurement" | "Close";
  districts: string[];
  pathway: string;
  decidedOn: string;
}

export interface Pilot {
  id: string;
  proposalId: string;
  challengeId: string;
  startupId: string;
  status: PilotStatus;
  contractValue: number;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
  kpis: KpiPoint[];
  kpiSeries: { month: string; actual: number; target: number }[];
  risks: Risk[];
  sandbox: SandboxScope;
  compliance: ComplianceState;
  validation?: Validation;
  scale?: ScaleDecision;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  role: Role;
  action: string;
  entity: string;
  entityId: string;
}

export interface AppNotification {
  id: string;
  forRole: Role;
  text: string;
  at: string;
  read: boolean;
  href?: string;
}

export type TemplateKind =
  | "problem"
  | "evaluation"
  | "pilot"
  | "dataip"
  | "cyber"
  | "risk"
  | "pathway";

export interface Template {
  id: string;
  kind: TemplateKind;
  title: string;
  description: string;
  sections: { heading: string; body: string }[];
}

export interface DemoState {
  challenges: Challenge[];
  startups: Startup[];
  proposals: Proposal[];
  pilots: Pilot[];
  templates: Template[];
  auditLog: AuditEvent[];
  notifications: AppNotification[];
  evaluatorScores: Record<string, Record<string, number>>;
  hydrated: boolean;
  lang: "en" | "hi" | "mr";
}

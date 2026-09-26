-- Add missing columns to procurement_proposals for AI evaluations and workflow tracking
ALTER TABLE procurement_proposals
ADD COLUMN IF NOT EXISTS meeting_id text,
ADD COLUMN IF NOT EXISTS ai_match_score numeric,
ADD COLUMN IF NOT EXISTS report_id text,
ADD COLUMN IF NOT EXISTS evaluated_at timestamptz,
ADD COLUMN IF NOT EXISTS decided_at timestamptz,
ADD COLUMN IF NOT EXISTS officer_notes text;

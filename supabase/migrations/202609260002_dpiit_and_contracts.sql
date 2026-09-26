-- Add DPIIT integration fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dpiit_number text,
ADD COLUMN IF NOT EXISTS dpiit_verified boolean DEFAULT false;

-- Add contract text storage to procurement proposals
ALTER TABLE procurement_proposals
ADD COLUMN IF NOT EXISTS contract_text text;

-- Add GeM export flag
ALTER TABLE procurement_proposals
ADD COLUMN IF NOT EXISTS gem_exported boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gem_export_id text;

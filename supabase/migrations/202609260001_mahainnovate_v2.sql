-- MahaInnovate PS-26136 V2 Schema
-- Extends profiles and adds procurement tables.

-- 1. Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role            text NOT NULL DEFAULT 'startup_founder'
    CHECK (role IN ('startup_founder','department_officer','validator','platform_admin')),
  ADD COLUMN IF NOT EXISTS startup_name   text,
  ADD COLUMN IF NOT EXISTS department_name text,
  ADD COLUMN IF NOT EXISTS gstin          text,
  ADD COLUMN IF NOT EXISTS dpiit_number   text,
  ADD COLUMN IF NOT EXISTS domain_tags    text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tech_stack     text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS district       text;

-- Update the handle_new_user trigger to preserve the role column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_name text;
  resolved_role text;
BEGIN
  resolved_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'user_name',
    SPLIT_PART(COALESCE(NEW.email, ''), '@', 1)
  );

  resolved_role := COALESCE(
    NEW.raw_user_meta_data ->> 'role',
    'startup_founder'
  );

  IF resolved_role NOT IN ('startup_founder', 'department_officer', 'validator', 'platform_admin') THEN
    resolved_role := 'startup_founder';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, display_name, avatar_url, provider, role)
  VALUES (
    NEW.id,
    NEW.email,
    resolved_name,
    resolved_name,
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture'
    ),
    COALESCE(NEW.raw_app_meta_data ->> 'provider', 'email'),
    resolved_role
  )
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role WHERE public.profiles.role = 'startup_founder'; -- only update role if they were previously a generic founder

  RETURN NEW;
END;
$$;


-- 2. Create Audit Log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id           bigserial PRIMARY KEY,
  actor_id     uuid NOT NULL REFERENCES auth.users(id),
  actor_role   text NOT NULL,
  entity_type  text NOT NULL,
  entity_id    text NOT NULL, -- using text to handle UUIDs and string IDs
  action       text NOT NULL,
  old_value    jsonb,
  new_value    jsonb,
  ip_address   inet,
  created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admins can read audit log" ON public.audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin'));
-- No INSERT/UPDATE/DELETE policy. INSERT happens via SECURITY DEFINER function.

CREATE OR REPLACE FUNCTION public.write_audit_log_entry(
  p_actor_id uuid,
  p_actor_role text,
  p_entity_type text,
  p_entity_id text,
  p_action text,
  p_old_value jsonb DEFAULT NULL,
  p_new_value jsonb DEFAULT NULL
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.audit_log (actor_id, actor_role, entity_type, entity_id, action, old_value, new_value)
  VALUES (p_actor_id, p_actor_role, p_entity_type, p_entity_id, p_action, p_old_value, p_new_value);
$$;

-- 3. Create Challenges
CREATE TABLE IF NOT EXISTS public.challenges (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id       uuid NOT NULL REFERENCES auth.users(id),
  title               text NOT NULL,
  description         text NOT NULL,
  outcome             text NOT NULL,
  domain              text NOT NULL,
  budget_inr          numeric,
  status              text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'evaluating')),
  ai_copilot_output   jsonb,
  district            text,
  sector              text,
  pilot_duration_days integer,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- 4. Create Procurement Proposals
CREATE TABLE IF NOT EXISTS public.procurement_proposals (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id          uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  startup_id            uuid NOT NULL REFERENCES auth.users(id),
  proposal_text         text NOT NULL,
  status                text NOT NULL DEFAULT 'submitted'
                        CHECK (status IN ('submitted', 'evaluating', 'evaluated', 'approved', 'pilot_active', 'validation', 'decided', 'rejected')),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- 5. Create Milestones
CREATE TABLE IF NOT EXISTS public.milestones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id     uuid NOT NULL REFERENCES public.procurement_proposals(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text NOT NULL,
  payment_inr     numeric,
  due_date        date,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'evidence_submitted', 'completed', 'rejected')),
  evidence_url    text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 6. Create Pilot KPIs
CREATE TABLE IF NOT EXISTS public.pilot_kpis (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id      uuid NOT NULL REFERENCES public.procurement_proposals(id) ON DELETE CASCADE,
  name             text NOT NULL,
  description      text NOT NULL,
  unit             text NOT NULL,
  direction        text NOT NULL DEFAULT 'higher_is_better' CHECK (direction IN ('higher_is_better', 'lower_is_better')),
  baseline_value   numeric(12,4) NOT NULL,
  target_value     numeric(12,4) NOT NULL,
  status           text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'missed', 'insufficient_data')),
  source           text NOT NULL DEFAULT 'officer_defined' CHECK (source IN ('ai_suggested', 'officer_defined')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 7. Create Pilot Evidence
CREATE TABLE IF NOT EXISTS public.pilot_evidence (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id   uuid NOT NULL REFERENCES public.procurement_proposals(id) ON DELETE CASCADE,
  milestone_id  uuid REFERENCES public.milestones(id),
  uploaded_by   uuid NOT NULL REFERENCES auth.users(id),
  title         text NOT NULL,
  description   text,
  evidence_type text NOT NULL CHECK (evidence_type IN ('report','database_record','api_log','photo','video','user_feedback','financial_record','performance_report','test_result','other')),
  file_path     text,
  external_url  text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 8. Create KPI Observations
CREATE TABLE IF NOT EXISTS public.kpi_observations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id         uuid NOT NULL REFERENCES public.pilot_kpis(id) ON DELETE CASCADE,
  evidence_id    uuid REFERENCES public.pilot_evidence(id),
  observed_value numeric(12,4) NOT NULL,
  observed_at    timestamptz NOT NULL DEFAULT now(),
  notes          text,
  submitted_by   uuid NOT NULL REFERENCES auth.users(id)
);

-- 9. Create Validation Results
CREATE TABLE IF NOT EXISTS public.validation_results (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id      uuid NOT NULL REFERENCES public.procurement_proposals(id) ON DELETE CASCADE,
  kpi_id           uuid NOT NULL REFERENCES public.pilot_kpis(id) ON DELETE CASCADE,
  validator_id     uuid NOT NULL REFERENCES auth.users(id),
  evidence_id      uuid REFERENCES public.pilot_evidence(id),
  status           text NOT NULL CHECK (status IN ('verified','partially_verified','not_verified','insufficient_evidence')),
  validated_value  numeric(12,4),
  notes            text NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (proposal_id, kpi_id, validator_id)
);

-- 10. Create Validated Solutions
CREATE TABLE IF NOT EXISTS public.validated_solutions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id      uuid NOT NULL UNIQUE REFERENCES public.procurement_proposals(id) ON DELETE CASCADE,
  startup_id       uuid NOT NULL REFERENCES auth.users(id),
  challenge_id     uuid NOT NULL REFERENCES public.challenges(id),
  department_id    uuid NOT NULL REFERENCES auth.users(id),
  is_replicable    boolean NOT NULL DEFAULT false,
  final_report     jsonb,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- 11. Create Procurement Decisions
CREATE TABLE IF NOT EXISTS public.procurement_decisions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id  uuid NOT NULL UNIQUE REFERENCES public.procurement_proposals(id) ON DELETE RESTRICT,
  decision     text NOT NULL CHECK (decision IN ('stop', 'extend_pilot', 'improve', 'scale', 'procure', 'replicate')),
  decided_by   uuid NOT NULL REFERENCES auth.users(id),
  notes        text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- 12. Create Decision Districts
CREATE TABLE IF NOT EXISTS public.decision_districts (
  decision_id  uuid NOT NULL REFERENCES public.procurement_decisions(id) ON DELETE CASCADE,
  district     text NOT NULL,
  PRIMARY KEY (decision_id, district)
);

-- Helper function to get KPI score
CREATE OR REPLACE FUNCTION public.get_pilot_kpi_score(p_proposal_id uuid) RETURNS integer AS $$
  SELECT COALESCE(
    ROUND(
      100.0 * COUNT(*) FILTER (WHERE status = 'achieved') / NULLIF(COUNT(*), 0)
    )::integer, 0
  ) FROM public.pilot_kpis WHERE proposal_id = p_proposal_id;
$$ LANGUAGE sql STABLE;

-- Storage Bucket for pilot evidence
INSERT INTO storage.buckets (id, name, public) VALUES ('pilot-evidence', 'pilot-evidence', false) ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Startup can upload evidence" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pilot-evidence');
CREATE POLICY "Users can read evidence" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'pilot-evidence');


-- RLS Configuration
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validated_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_districts ENABLE ROW LEVEL SECURITY;

-- Helper Functions for RLS
CREATE OR REPLACE FUNCTION public.has_role(p_role text) RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = p_role);
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_platform_admin() RETURNS boolean AS $$
  SELECT public.has_role('platform_admin');
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_access_challenge(p_challenge_id uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.challenges c
    WHERE c.id = p_challenge_id AND c.department_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_access_proposal(p_proposal_id uuid) RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.procurement_proposals p
    LEFT JOIN public.challenges c ON c.id = p.challenge_id
    WHERE p.id = p_proposal_id AND (p.startup_id = auth.uid() OR c.department_id = auth.uid() OR public.is_platform_admin() OR public.has_role('validator'))
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies: Challenges
CREATE POLICY "Anyone can read open challenges" ON public.challenges FOR SELECT USING (status = 'open' OR public.is_platform_admin());
CREATE POLICY "Departments can manage their challenges" ON public.challenges FOR ALL USING (department_id = auth.uid());

-- Policies: Proposals
CREATE POLICY "Users can access related proposals" ON public.procurement_proposals FOR SELECT USING (public.can_access_proposal(id));
CREATE POLICY "Startups can insert their proposals" ON public.procurement_proposals FOR INSERT WITH CHECK (startup_id = auth.uid());
CREATE POLICY "Departments can update their challenge proposals" ON public.procurement_proposals FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.challenges c WHERE c.id = challenge_id AND c.department_id = auth.uid())
);

-- Policies: Milestones
CREATE POLICY "Users can access related milestones" ON public.milestones FOR SELECT USING (public.can_access_proposal(proposal_id));
CREATE POLICY "Departments can manage milestones" ON public.milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM public.procurement_proposals p JOIN public.challenges c ON c.id = p.challenge_id WHERE p.id = proposal_id AND c.department_id = auth.uid())
);
CREATE POLICY "Startups can update milestones (evidence)" ON public.milestones FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.procurement_proposals p WHERE p.id = proposal_id AND p.startup_id = auth.uid())
);

-- Policies: Pilot KPIs
CREATE POLICY "Users can access related KPIs" ON public.pilot_kpis FOR SELECT USING (public.can_access_proposal(proposal_id));
CREATE POLICY "Departments can manage KPIs" ON public.pilot_kpis FOR ALL USING (
  EXISTS (SELECT 1 FROM public.procurement_proposals p JOIN public.challenges c ON c.id = p.challenge_id WHERE p.id = proposal_id AND c.department_id = auth.uid())
);

-- Policies: Pilot Evidence
CREATE POLICY "Users can access related evidence" ON public.pilot_evidence FOR SELECT USING (public.can_access_proposal(proposal_id) OR public.has_role('validator'));
CREATE POLICY "Startups can insert evidence" ON public.pilot_evidence FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.procurement_proposals p WHERE p.id = proposal_id AND p.startup_id = auth.uid())
);
CREATE POLICY "Officers can insert evidence" ON public.pilot_evidence FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.procurement_proposals p JOIN public.challenges c ON c.id = p.challenge_id WHERE p.id = proposal_id AND c.department_id = auth.uid())
);

-- Policies: KPI Observations
CREATE POLICY "Users can access related observations" ON public.kpi_observations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pilot_kpis k WHERE k.id = kpi_id AND public.can_access_proposal(k.proposal_id))
);
CREATE POLICY "Startups can insert observations" ON public.kpi_observations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.pilot_kpis k JOIN public.procurement_proposals p ON p.id = k.proposal_id WHERE k.id = kpi_id AND p.startup_id = auth.uid())
);

-- Policies: Validation Results
CREATE POLICY "Users can access related validations" ON public.validation_results FOR SELECT USING (public.can_access_proposal(proposal_id) OR public.has_role('validator'));
CREATE POLICY "Validators can insert results" ON public.validation_results FOR INSERT WITH CHECK (validator_id = auth.uid() AND public.has_role('validator'));

-- Policies: Validated Solutions
CREATE POLICY "Anyone can view validated solutions" ON public.validated_solutions FOR SELECT USING (true);
CREATE POLICY "Departments can manage validated solutions" ON public.validated_solutions FOR ALL USING (department_id = auth.uid());

-- Policies: Procurement Decisions
CREATE POLICY "Users can access related decisions" ON public.procurement_decisions FOR SELECT USING (public.can_access_proposal(proposal_id));
CREATE POLICY "Departments can manage decisions" ON public.procurement_decisions FOR ALL USING (decided_by = auth.uid());

-- Policies: Decision Districts
CREATE POLICY "Users can access related decision districts" ON public.decision_districts FOR SELECT USING (true);
CREATE POLICY "Departments can manage decision districts" ON public.decision_districts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.procurement_decisions d WHERE d.id = decision_id AND d.decided_by = auth.uid())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_domain ON public.challenges(domain);
CREATE INDEX IF NOT EXISTS idx_proposals_challenge ON public.procurement_proposals(challenge_id);
CREATE INDEX IF NOT EXISTS idx_proposals_startup ON public.procurement_proposals(startup_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.procurement_proposals(status);
CREATE INDEX IF NOT EXISTS idx_milestones_proposal ON public.milestones(proposal_id);
CREATE INDEX IF NOT EXISTS idx_pilot_kpis_proposal ON public.pilot_kpis(proposal_id);
CREATE INDEX IF NOT EXISTS idx_kpi_obs_kpi_time ON public.kpi_observations(kpi_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_log(actor_id, created_at DESC);

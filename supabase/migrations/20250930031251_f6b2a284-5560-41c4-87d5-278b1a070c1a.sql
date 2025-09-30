-- Add A/B test tracking variant column to friction events
ALTER TABLE public.friction_events ADD COLUMN IF NOT EXISTS variant_id text;

-- Create A/B tests table
CREATE TABLE IF NOT EXISTS public.ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for A/B tests
CREATE POLICY "Users can view their own A/B tests"
  ON public.ab_tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create A/B tests"
  ON public.ab_tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own A/B tests"
  ON public.ab_tests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own A/B tests"
  ON public.ab_tests FOR DELETE
  USING (auth.uid() = user_id);

-- Create team members table for collaboration
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id uuid NOT NULL,
  member_email text NOT NULL,
  member_user_id uuid,
  role text NOT NULL DEFAULT 'viewer',
  status text NOT NULL DEFAULT 'pending',
  invited_at timestamp with time zone DEFAULT now(),
  joined_at timestamp with time zone,
  UNIQUE(team_owner_id, member_email)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team members
CREATE POLICY "Team owners can manage their team"
  ON public.team_members FOR ALL
  USING (auth.uid() = team_owner_id);

CREATE POLICY "Team members can view their team"
  ON public.team_members FOR SELECT
  USING (auth.uid() = member_user_id OR auth.uid() = team_owner_id);

CREATE POLICY "Invited members can update their status"
  ON public.team_members FOR UPDATE
  USING (auth.uid() = member_user_id)
  WITH CHECK (auth.uid() = member_user_id);
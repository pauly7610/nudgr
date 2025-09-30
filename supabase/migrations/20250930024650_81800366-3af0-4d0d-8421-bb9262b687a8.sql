-- Create API keys table for customer projects
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  key_name text NOT NULL,
  api_key text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  allowed_domains text[] DEFAULT ARRAY[]::text[],
  rate_limit_per_minute integer DEFAULT 1000,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Users can view their own API keys
CREATE POLICY "Users can view their own API keys"
  ON public.api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own API keys
CREATE POLICY "Users can create their own API keys"
  ON public.api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own API keys
CREATE POLICY "Users can update their own API keys"
  ON public.api_keys
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own API keys
CREATE POLICY "Users can delete their own API keys"
  ON public.api_keys
  FOR DELETE
  USING (auth.uid() = user_id);

-- System can read API keys for validation
CREATE POLICY "System can read API keys"
  ON public.api_keys
  FOR SELECT
  USING (true);

-- Create index for fast API key lookup
CREATE INDEX idx_api_keys_key ON public.api_keys(api_key) WHERE is_active = true;
CREATE INDEX idx_api_keys_user ON public.api_keys(user_id);

-- Add screenshot_url column to friction_events if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'friction_events' 
    AND column_name = 'screenshot_url'
  ) THEN
    ALTER TABLE public.friction_events ADD COLUMN screenshot_url text;
  END IF;
END $$;
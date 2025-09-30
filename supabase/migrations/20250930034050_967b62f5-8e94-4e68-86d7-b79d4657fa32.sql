-- Create usage tracking table
CREATE TABLE public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('session_recording', 'data_storage')),
  amount NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL CHECK (unit IN ('recordings', 'gb', 'mb')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, usage_type, period_start)
);

-- Enable RLS
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own usage"
  ON public.usage_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage records"
  ON public.usage_records
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update usage records"
  ON public.usage_records
  FOR UPDATE
  USING (true);

-- Create usage limits table
CREATE TABLE public.usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier public.subscription_tier NOT NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('session_recording', 'data_storage')),
  included_amount NUMERIC NOT NULL DEFAULT 0,
  overage_price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL CHECK (unit IN ('recordings', 'gb', 'mb')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tier, usage_type)
);

-- Enable RLS
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view usage limits"
  ON public.usage_limits
  FOR SELECT
  USING (true);

-- Insert default usage limits
INSERT INTO public.usage_limits (tier, usage_type, included_amount, overage_price, unit) VALUES
  ('free', 'session_recording', 100, 0, 'recordings'),
  ('free', 'data_storage', 1, 0, 'gb'),
  ('professional', 'session_recording', 1000, 0.10, 'recordings'),
  ('professional', 'data_storage', 10, 0.05, 'gb'),
  ('enterprise', 'session_recording', -1, 0, 'recordings'), -- -1 means unlimited
  ('enterprise', 'data_storage', 100, 0.02, 'gb');

-- Function to get current usage for a user
CREATE OR REPLACE FUNCTION public.get_current_usage(_user_id uuid, _usage_type text)
RETURNS NUMERIC
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM public.usage_records
  WHERE user_id = _user_id 
    AND usage_type = _usage_type
    AND period_start >= date_trunc('month', CURRENT_DATE)
    AND period_end <= date_trunc('month', CURRENT_DATE) + interval '1 month'
$$;

-- Function to check if user is within limits
CREATE OR REPLACE FUNCTION public.check_usage_limit(_user_id uuid, _usage_type text)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_tier subscription_tier;
  limit_amount NUMERIC;
  current_usage NUMERIC;
BEGIN
  -- Get user's tier
  SELECT tier INTO current_tier
  FROM public.subscriptions
  WHERE user_id = _user_id AND status = 'active'
  LIMIT 1;
  
  -- Get limit for this tier
  SELECT included_amount INTO limit_amount
  FROM public.usage_limits
  WHERE tier = current_tier AND usage_type = _usage_type;
  
  -- -1 means unlimited
  IF limit_amount = -1 THEN
    RETURN true;
  END IF;
  
  -- Get current usage
  current_usage := public.get_current_usage(_user_id, _usage_type);
  
  RETURN current_usage < limit_amount;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_usage_records_updated_at
  BEFORE UPDATE ON public.usage_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
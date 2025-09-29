-- Create rate_limits table to track API usage
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, endpoint)
);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy to allow the service role to manage rate limits
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX idx_rate_limits_identifier_endpoint ON public.rate_limits(identifier, endpoint);
CREATE INDEX idx_rate_limits_window_start ON public.rate_limits(window_start);

-- Function to clean up old rate limit entries
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
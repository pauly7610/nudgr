-- Create error logs table
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_name TEXT,
  page_url TEXT,
  user_agent TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  page_url TEXT NOT NULL,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}',
  page_url TEXT,
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for error_logs
CREATE POLICY "Admins can view all error logs"
  ON public.error_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert error logs"
  ON public.error_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update error logs"
  ON public.error_logs FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for performance_metrics
CREATE POLICY "Admins can view all performance metrics"
  ON public.performance_metrics FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert performance metrics"
  ON public.performance_metrics FOR INSERT
  WITH CHECK (true);

-- RLS Policies for analytics_events
CREATE POLICY "Admins can view all analytics events"
  ON public.analytics_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(resolved);

CREATE INDEX idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_metric_name ON public.performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_created_at ON public.performance_metrics(created_at DESC);

CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- Function to get error statistics
CREATE OR REPLACE FUNCTION public.get_error_statistics(
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  total_errors BIGINT,
  critical_errors BIGINT,
  unresolved_errors BIGINT,
  error_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_errors,
    COUNT(*) FILTER (WHERE severity = 'critical')::BIGINT as critical_errors,
    COUNT(*) FILTER (WHERE resolved = false)::BIGINT as unresolved_errors,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(*) FILTER (WHERE severity IN ('high', 'critical'))::NUMERIC / COUNT(*)::NUMERIC) * 100
      ELSE 0
    END as error_rate
  FROM public.error_logs
  WHERE created_at BETWEEN p_start_date AND p_end_date;
END;
$$;

-- Function to get performance statistics
CREATE OR REPLACE FUNCTION public.get_performance_statistics(
  p_metric_name TEXT,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  avg_value NUMERIC,
  min_value NUMERIC,
  max_value NUMERIC,
  p50_value NUMERIC,
  p95_value NUMERIC,
  p99_value NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    AVG(metric_value) as avg_value,
    MIN(metric_value) as min_value,
    MAX(metric_value) as max_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY metric_value) as p50_value,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY metric_value) as p95_value,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY metric_value) as p99_value
  FROM public.performance_metrics
  WHERE metric_name = p_metric_name
    AND created_at BETWEEN p_start_date AND p_end_date;
END;
$$;
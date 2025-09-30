-- Create heatmap_data table for aggregated interaction data
CREATE TABLE public.heatmap_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  element_selector TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('click', 'hover', 'scroll', 'form_field', 'rage_click')),
  x_position INTEGER,
  y_position INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  interaction_count INTEGER DEFAULT 1,
  total_duration_ms INTEGER DEFAULT 0,
  avg_duration_ms INTEGER GENERATED ALWAYS AS (CASE WHEN interaction_count > 0 THEN total_duration_ms / interaction_count ELSE 0 END) STORED,
  friction_score INTEGER DEFAULT 0 CHECK (friction_score >= 0 AND friction_score <= 100),
  date_bucket DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.heatmap_data ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_heatmap_page_url ON public.heatmap_data(page_url);
CREATE INDEX idx_heatmap_date_bucket ON public.heatmap_data(date_bucket DESC);
CREATE INDEX idx_heatmap_interaction_type ON public.heatmap_data(interaction_type);
CREATE INDEX idx_heatmap_friction_score ON public.heatmap_data(friction_score DESC);

-- Create scroll_depth_analytics table
CREATE TABLE public.scroll_depth_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  max_scroll_percentage INTEGER NOT NULL CHECK (max_scroll_percentage >= 0 AND max_scroll_percentage <= 100),
  avg_scroll_percentage INTEGER NOT NULL CHECK (avg_scroll_percentage >= 0 AND avg_scroll_percentage <= 100),
  bounce_at_percentage INTEGER CHECK (bounce_at_percentage >= 0 AND bounce_at_percentage <= 100),
  total_sessions INTEGER DEFAULT 1,
  date_bucket DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.scroll_depth_analytics ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_scroll_page_url ON public.scroll_depth_analytics(page_url);
CREATE INDEX idx_scroll_date_bucket ON public.scroll_depth_analytics(date_bucket DESC);

-- Create page_performance_metrics table
CREATE TABLE public.page_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  avg_load_time_ms INTEGER,
  avg_time_to_interactive_ms INTEGER,
  avg_first_contentful_paint_ms INTEGER,
  total_page_views INTEGER DEFAULT 1,
  bounce_rate DECIMAL(5,2),
  avg_time_on_page_seconds INTEGER,
  exit_rate DECIMAL(5,2),
  date_bucket DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.page_performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_performance_page_url ON public.page_performance_metrics(page_url);
CREATE INDEX idx_performance_date_bucket ON public.page_performance_metrics(date_bucket DESC);

-- Create form_analytics table
CREATE TABLE public.form_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  form_selector TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_type TEXT,
  total_interactions INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  error_rate DECIMAL(5,2) GENERATED ALWAYS AS (CASE WHEN total_interactions > 0 THEN (total_errors::DECIMAL / total_interactions::DECIMAL * 100) ELSE 0 END) STORED,
  avg_time_to_complete_ms INTEGER,
  abandonment_count INTEGER DEFAULT 0,
  abandonment_rate DECIMAL(5,2),
  common_error_messages JSONB DEFAULT '[]'::jsonb,
  date_bucket DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.form_analytics ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_form_page_url ON public.form_analytics(page_url);
CREATE INDEX idx_form_error_rate ON public.form_analytics(error_rate DESC);
CREATE INDEX idx_form_date_bucket ON public.form_analytics(date_bucket DESC);

-- Create dashboard_configs table
CREATE TABLE public.dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  filters JSONB DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  shared_with_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.dashboard_configs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_dashboard_user_id ON public.dashboard_configs(user_id);
CREATE INDEX idx_dashboard_is_default ON public.dashboard_configs(is_default) WHERE is_default = true;

-- Create alerts_config table
CREATE TABLE public.alerts_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('friction_spike', 'error_rate', 'conversion_drop', 'performance', 'custom')),
  conditions JSONB NOT NULL,
  notification_channels JSONB DEFAULT '["email"]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.alerts_config ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_alerts_user_id ON public.alerts_config(user_id);
CREATE INDEX idx_alerts_active ON public.alerts_config(is_active) WHERE is_active = true;

-- RLS Policies for heatmap_data
CREATE POLICY "Admins and analysts can view heatmap data"
  ON public.heatmap_data FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'analyst')
  );

CREATE POLICY "System can insert heatmap data"
  ON public.heatmap_data FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update heatmap data"
  ON public.heatmap_data FOR UPDATE
  USING (true);

-- RLS Policies for scroll_depth_analytics
CREATE POLICY "Admins and analysts can view scroll analytics"
  ON public.scroll_depth_analytics FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'analyst')
  );

CREATE POLICY "System can insert scroll analytics"
  ON public.scroll_depth_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update scroll analytics"
  ON public.scroll_depth_analytics FOR UPDATE
  USING (true);

-- RLS Policies for page_performance_metrics
CREATE POLICY "Admins and analysts can view performance metrics"
  ON public.page_performance_metrics FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'analyst')
  );

CREATE POLICY "System can insert performance metrics"
  ON public.page_performance_metrics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update performance metrics"
  ON public.page_performance_metrics FOR UPDATE
  USING (true);

-- RLS Policies for form_analytics
CREATE POLICY "Admins and analysts can view form analytics"
  ON public.form_analytics FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'analyst')
  );

CREATE POLICY "System can insert form analytics"
  ON public.form_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update form analytics"
  ON public.form_analytics FOR UPDATE
  USING (true);

-- RLS Policies for dashboard_configs
CREATE POLICY "Users can view their own dashboards"
  ON public.dashboard_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared dashboards"
  ON public.dashboard_configs FOR SELECT
  USING (
    is_shared = true AND 
    (
      shared_with_roles = ARRAY[]::TEXT[] OR
      public.get_user_role(auth.uid())::TEXT = ANY(shared_with_roles)
    )
  );

CREATE POLICY "Users can create their own dashboards"
  ON public.dashboard_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dashboards"
  ON public.dashboard_configs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dashboards"
  ON public.dashboard_configs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for alerts_config
CREATE POLICY "Users can view their own alerts"
  ON public.alerts_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all alerts"
  ON public.alerts_config FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own alerts"
  ON public.alerts_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
  ON public.alerts_config FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
  ON public.alerts_config FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at on new tables
CREATE TRIGGER set_updated_at_heatmap_data
  BEFORE UPDATE ON public.heatmap_data
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_scroll_depth
  BEFORE UPDATE ON public.scroll_depth_analytics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_performance
  BEFORE UPDATE ON public.page_performance_metrics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_form_analytics
  BEFORE UPDATE ON public.form_analytics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_dashboard_configs
  BEFORE UPDATE ON public.dashboard_configs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_alerts_config
  BEFORE UPDATE ON public.alerts_config
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
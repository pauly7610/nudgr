-- Create storage buckets for session recordings and exports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('session-recordings', 'session-recordings', false, 52428800, ARRAY['video/webm', 'video/mp4']::text[]),
  ('friction-screenshots', 'friction-screenshots', false, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]),
  ('pdf-exports', 'pdf-exports', false, 10485760, ARRAY['application/pdf']::text[]);

-- RLS Policies for session-recordings bucket
CREATE POLICY "Admins and analysts can view session recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'session-recordings' AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'analyst'))
  );

CREATE POLICY "System can upload session recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'session-recordings');

CREATE POLICY "Admins can delete old recordings"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'session-recordings' AND
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for friction-screenshots bucket
CREATE POLICY "Admins and analysts can view screenshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'friction-screenshots' AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'analyst'))
  );

CREATE POLICY "System can upload screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'friction-screenshots');

CREATE POLICY "Users can delete their own screenshots"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'friction-screenshots' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policies for pdf-exports bucket
CREATE POLICY "Users can view their own exports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pdf-exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all exports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'pdf-exports' AND
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can upload their own exports"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'pdf-exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own exports"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'pdf-exports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create table for session recording metadata
CREATE TABLE public.session_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  recording_start TIMESTAMP WITH TIME ZONE NOT NULL,
  recording_end TIMESTAMP WITH TIME ZONE,
  friction_events_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_session_recordings_session_id ON public.session_recordings(session_id);
CREATE INDEX idx_session_recordings_created_at ON public.session_recordings(created_at DESC);

-- RLS for session_recordings
CREATE POLICY "Admins and analysts can view session recording metadata"
  ON public.session_recordings FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'analyst')
  );

CREATE POLICY "System can insert session recordings"
  ON public.session_recordings FOR INSERT
  WITH CHECK (true);

-- Create table for export jobs
CREATE TABLE public.export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('pdf', 'csv', 'json')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  storage_path TEXT,
  parameters JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_export_jobs_user_id ON public.export_jobs(user_id);
CREATE INDEX idx_export_jobs_status ON public.export_jobs(status);
CREATE INDEX idx_export_jobs_created_at ON public.export_jobs(created_at DESC);

-- RLS for export_jobs
CREATE POLICY "Users can view their own export jobs"
  ON public.export_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create export jobs"
  ON public.export_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update export jobs"
  ON public.export_jobs FOR UPDATE
  USING (true);

-- Create table for notification log
CREATE TABLE public.notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES public.alerts_config(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'slack')),
  recipient TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_notification_log_alert_id ON public.notification_log(alert_id);
CREATE INDEX idx_notification_log_created_at ON public.notification_log(created_at DESC);

-- RLS for notification_log
CREATE POLICY "Admins can view all notifications"
  ON public.notification_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert notifications"
  ON public.notification_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update notifications"
  ON public.notification_log FOR UPDATE
  USING (true);
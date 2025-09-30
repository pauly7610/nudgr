-- Create app_role enum for RBAC
CREATE TYPE public.app_role AS ENUM ('admin', 'analyst', 'viewer');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table for RBAC
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'admin' THEN 1
    WHEN 'analyst' THEN 2
    WHEN 'viewer' THEN 3
  END
  LIMIT 1
$$;

-- Create sessions table for tracking user sessions
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  session_end TIMESTAMP WITH TIME ZONE,
  page_url TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_created_at ON public.sessions(created_at DESC);

-- Create friction_events table with severity scoring
CREATE TABLE public.friction_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  severity_score INTEGER NOT NULL CHECK (severity_score >= 0 AND severity_score <= 100),
  element_selector TEXT,
  page_url TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  user_action TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.friction_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_friction_events_session_id ON public.friction_events(session_id);
CREATE INDEX idx_friction_events_severity ON public.friction_events(severity_score DESC);
CREATE INDEX idx_friction_events_timestamp ON public.friction_events(timestamp DESC);

-- Create cohorts table for cohort analysis
CREATE TABLE public.cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_cohorts_created_by ON public.cohorts(created_by);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for sessions
CREATE POLICY "Admins and analysts can view all sessions"
  ON public.sessions FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'analyst')
  );

CREATE POLICY "Viewers can view their own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for friction_events
CREATE POLICY "Admins and analysts can view all friction events"
  ON public.friction_events FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'analyst')
  );

CREATE POLICY "System can insert friction events"
  ON public.friction_events FOR INSERT
  WITH CHECK (true);

-- RLS Policies for cohorts
CREATE POLICY "All authenticated users can view cohorts"
  ON public.cohorts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and analysts can create cohorts"
  ON public.cohorts FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'analyst')
  );

CREATE POLICY "Admins and analysts can update their own cohorts"
  ON public.cohorts FOR UPDATE
  USING (
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'analyst')) 
    AND created_by = auth.uid()
  );

CREATE POLICY "Admins can delete any cohort"
  ON public.cohorts FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  
  -- Assign default viewer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$;

-- Trigger to call handle_new_user on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_cohorts
  BEFORE UPDATE ON public.cohorts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
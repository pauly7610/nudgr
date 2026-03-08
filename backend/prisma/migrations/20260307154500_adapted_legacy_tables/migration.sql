-- Railway-safe adapted migration from legacy Supabase SQL.
-- Intentionally excludes Supabase-only auth/storage/RLS constructs.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Rate limits table retained from legacy schema.
CREATE TABLE IF NOT EXISTS "RateLimit" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "identifier" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "requestCount" INTEGER NOT NULL DEFAULT 1,
  "windowStart" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("identifier", "endpoint")
);

CREATE INDEX IF NOT EXISTS "RateLimit_identifier_endpoint_idx"
  ON "RateLimit" ("identifier", "endpoint");
CREATE INDEX IF NOT EXISTS "RateLimit_windowStart_idx"
  ON "RateLimit" ("windowStart");

CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM "RateLimit"
  WHERE "windowStart" < NOW() - INTERVAL '1 hour';
END;
$$;

-- Aggregated analytics tables.
CREATE TABLE IF NOT EXISTS "HeatmapData" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "pageUrl" TEXT NOT NULL,
  "elementSelector" TEXT NOT NULL,
  "interactionType" TEXT NOT NULL CHECK ("interactionType" IN ('click', 'hover', 'scroll', 'form_field', 'rage_click')),
  "xPosition" INTEGER,
  "yPosition" INTEGER,
  "viewportWidth" INTEGER,
  "viewportHeight" INTEGER,
  "interactionCount" INTEGER NOT NULL DEFAULT 1,
  "totalDurationMs" INTEGER NOT NULL DEFAULT 0,
  "avgDurationMs" INTEGER GENERATED ALWAYS AS (
    CASE WHEN "interactionCount" > 0 THEN "totalDurationMs" / "interactionCount" ELSE 0 END
  ) STORED,
  "frictionScore" INTEGER NOT NULL DEFAULT 0 CHECK ("frictionScore" >= 0 AND "frictionScore" <= 100),
  "dateBucket" DATE NOT NULL DEFAULT CURRENT_DATE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("pageUrl", "elementSelector", "interactionType", "dateBucket")
);

CREATE INDEX IF NOT EXISTS "HeatmapData_pageUrl_idx" ON "HeatmapData" ("pageUrl");
CREATE INDEX IF NOT EXISTS "HeatmapData_dateBucket_idx" ON "HeatmapData" ("dateBucket" DESC);
CREATE INDEX IF NOT EXISTS "HeatmapData_interactionType_idx" ON "HeatmapData" ("interactionType");
CREATE INDEX IF NOT EXISTS "HeatmapData_frictionScore_idx" ON "HeatmapData" ("frictionScore" DESC);

CREATE TABLE IF NOT EXISTS "ScrollDepthAnalytics" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "pageUrl" TEXT NOT NULL,
  "maxScrollPercentage" INTEGER NOT NULL CHECK ("maxScrollPercentage" >= 0 AND "maxScrollPercentage" <= 100),
  "avgScrollPercentage" INTEGER NOT NULL CHECK ("avgScrollPercentage" >= 0 AND "avgScrollPercentage" <= 100),
  "bounceAtPercentage" INTEGER CHECK ("bounceAtPercentage" >= 0 AND "bounceAtPercentage" <= 100),
  "totalSessions" INTEGER NOT NULL DEFAULT 1,
  "dateBucket" DATE NOT NULL DEFAULT CURRENT_DATE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "ScrollDepthAnalytics_pageUrl_idx" ON "ScrollDepthAnalytics" ("pageUrl");
CREATE INDEX IF NOT EXISTS "ScrollDepthAnalytics_dateBucket_idx" ON "ScrollDepthAnalytics" ("dateBucket" DESC);

CREATE TABLE IF NOT EXISTS "PagePerformanceMetric" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "pageUrl" TEXT NOT NULL,
  "avgLoadTimeMs" INTEGER,
  "avgTimeToInteractiveMs" INTEGER,
  "avgFirstContentfulPaintMs" INTEGER,
  "totalPageViews" INTEGER NOT NULL DEFAULT 1,
  "bounceRate" DECIMAL(5,2),
  "avgTimeOnPageSeconds" INTEGER,
  "exitRate" DECIMAL(5,2),
  "dateBucket" DATE NOT NULL DEFAULT CURRENT_DATE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "PagePerformanceMetric_pageUrl_idx" ON "PagePerformanceMetric" ("pageUrl");
CREATE INDEX IF NOT EXISTS "PagePerformanceMetric_dateBucket_idx" ON "PagePerformanceMetric" ("dateBucket" DESC);

CREATE TABLE IF NOT EXISTS "FormAnalytics" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "pageUrl" TEXT NOT NULL,
  "formSelector" TEXT NOT NULL,
  "fieldName" TEXT NOT NULL,
  "fieldType" TEXT,
  "totalInteractions" INTEGER NOT NULL DEFAULT 0,
  "totalErrors" INTEGER NOT NULL DEFAULT 0,
  "errorRate" DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN "totalInteractions" > 0 THEN ("totalErrors"::DECIMAL / "totalInteractions"::DECIMAL) * 100
      ELSE 0
    END
  ) STORED,
  "avgTimeToCompleteMs" INTEGER,
  "abandonmentCount" INTEGER NOT NULL DEFAULT 0,
  "abandonmentRate" DECIMAL(5,2),
  "commonErrorMessages" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "dateBucket" DATE NOT NULL DEFAULT CURRENT_DATE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "FormAnalytics_pageUrl_idx" ON "FormAnalytics" ("pageUrl");
CREATE INDEX IF NOT EXISTS "FormAnalytics_errorRate_idx" ON "FormAnalytics" ("errorRate" DESC);
CREATE INDEX IF NOT EXISTS "FormAnalytics_dateBucket_idx" ON "FormAnalytics" ("dateBucket" DESC);

-- App configuration and collaboration tables.
CREATE TABLE IF NOT EXISTS "DashboardConfig" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "layout" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "filters" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "isShared" BOOLEAN NOT NULL DEFAULT false,
  "sharedWithRoles" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "DashboardConfig_userId_idx" ON "DashboardConfig" ("userId");
CREATE INDEX IF NOT EXISTS "DashboardConfig_isDefault_idx" ON "DashboardConfig" ("isDefault") WHERE "isDefault" = true;

CREATE TABLE IF NOT EXISTS "AlertConfig" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "alertType" TEXT NOT NULL CHECK ("alertType" IN ('friction_spike', 'error_rate', 'conversion_drop', 'performance', 'custom')),
  "conditions" JSONB NOT NULL,
  "notificationChannels" JSONB NOT NULL DEFAULT '["email"]'::jsonb,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastTriggeredAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "AlertConfig_userId_idx" ON "AlertConfig" ("userId");
CREATE INDEX IF NOT EXISTS "AlertConfig_isActive_idx" ON "AlertConfig" ("isActive") WHERE "isActive" = true;

CREATE TABLE IF NOT EXISTS "AbTest" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "variants" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "AbTest_userId_idx" ON "AbTest" ("userId");

CREATE TABLE IF NOT EXISTS "TeamMember" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "teamOwnerId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "memberEmail" TEXT NOT NULL,
  "memberUserId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "role" TEXT NOT NULL DEFAULT 'viewer',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "invitedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "joinedAt" TIMESTAMPTZ,
  UNIQUE ("teamOwnerId", "memberEmail")
);

CREATE INDEX IF NOT EXISTS "TeamMember_teamOwnerId_idx" ON "TeamMember" ("teamOwnerId");
CREATE INDEX IF NOT EXISTS "TeamMember_memberUserId_idx" ON "TeamMember" ("memberUserId");

-- Recording and export metadata tables (storage handled by S3/R2 app layer).
CREATE TABLE IF NOT EXISTS "SessionRecording" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionId" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "durationSeconds" INTEGER,
  "fileSizeBytes" BIGINT,
  "recordingStart" TIMESTAMPTZ NOT NULL,
  "recordingEnd" TIMESTAMPTZ,
  "frictionEventsCount" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "SessionRecording_sessionId_idx" ON "SessionRecording" ("sessionId");
CREATE INDEX IF NOT EXISTS "SessionRecording_createdAt_idx" ON "SessionRecording" ("createdAt" DESC);

CREATE TABLE IF NOT EXISTS "ExportJob" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "exportType" TEXT NOT NULL CHECK ("exportType" IN ('pdf', 'csv', 'json')),
  "status" TEXT NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'processing', 'completed', 'failed')),
  "storagePath" TEXT,
  "parameters" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "completedAt" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS "ExportJob_userId_idx" ON "ExportJob" ("userId");
CREATE INDEX IF NOT EXISTS "ExportJob_status_idx" ON "ExportJob" ("status");
CREATE INDEX IF NOT EXISTS "ExportJob_createdAt_idx" ON "ExportJob" ("createdAt" DESC);

CREATE TABLE IF NOT EXISTS "NotificationLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "alertId" TEXT REFERENCES "AlertConfig"("id") ON DELETE SET NULL,
  "notificationType" TEXT NOT NULL CHECK ("notificationType" IN ('email', 'slack')),
  "recipient" TEXT NOT NULL,
  "subject" TEXT,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'sent', 'failed')),
  "errorMessage" TEXT,
  "sentAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "NotificationLog_alertId_idx" ON "NotificationLog" ("alertId");
CREATE INDEX IF NOT EXISTS "NotificationLog_createdAt_idx" ON "NotificationLog" ("createdAt" DESC);

-- Optional event stream table for legacy analytics endpoint compatibility.
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "eventName" TEXT NOT NULL,
  "eventProperties" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "pageUrl" TEXT,
  "sessionId" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "AnalyticsEvent_userId_idx" ON "AnalyticsEvent" ("userId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_eventName_idx" ON "AnalyticsEvent" ("eventName");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent" ("createdAt" DESC);

-- Legacy helper functions adapted to Prisma table names.
CREATE OR REPLACE FUNCTION public.upsert_heatmap_data(
  p_page_url TEXT,
  p_element_selector TEXT,
  p_interaction_type TEXT,
  p_friction_score INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO "HeatmapData" (
    "pageUrl",
    "elementSelector",
    "interactionType",
    "frictionScore",
    "interactionCount",
    "dateBucket"
  )
  VALUES (
    p_page_url,
    p_element_selector,
    p_interaction_type,
    p_friction_score,
    1,
    CURRENT_DATE
  )
  ON CONFLICT ("pageUrl", "elementSelector", "interactionType", "dateBucket")
  DO UPDATE SET
    "interactionCount" = "HeatmapData"."interactionCount" + 1,
    "frictionScore" = ("HeatmapData"."frictionScore" * "HeatmapData"."interactionCount" + p_friction_score) / ("HeatmapData"."interactionCount" + 1),
    "updatedAt" = NOW();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_error_statistics(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
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
    COUNT(*)::BIGINT AS total_errors,
    COUNT(*) FILTER (WHERE "severity" = 'critical')::BIGINT AS critical_errors,
    COUNT(*) FILTER (
      WHERE "severity" IN ('medium', 'high', 'critical')
    )::BIGINT AS unresolved_errors,
    CASE
      WHEN COUNT(*) > 0 THEN
        (COUNT(*) FILTER (WHERE "severity" IN ('high', 'critical'))::NUMERIC / COUNT(*)::NUMERIC) * 100
      ELSE 0
    END AS error_rate
  FROM "ErrorLog"
  WHERE "createdAt" BETWEEN p_start_date AND p_end_date;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_performance_statistics(
  p_metric_name TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
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
    AVG("metricValue")::NUMERIC AS avg_value,
    MIN("metricValue")::NUMERIC AS min_value,
    MAX("metricValue")::NUMERIC AS max_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "metricValue")::NUMERIC AS p50_value,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "metricValue")::NUMERIC AS p95_value,
    PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY "metricValue")::NUMERIC AS p99_value
  FROM "PerformanceMetric"
  WHERE "metricName" = p_metric_name
    AND "createdAt" BETWEEN p_start_date AND p_end_date;
END;
$$;

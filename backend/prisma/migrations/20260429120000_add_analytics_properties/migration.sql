-- First-class analytics properties for connected customer sites/apps.

CREATE TABLE "AnalyticsProperty" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "propertyType" TEXT NOT NULL DEFAULT 'website',
  "environment" TEXT NOT NULL DEFAULT 'production',
  "lastSeenAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AnalyticsProperty_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ApiKey" ADD COLUMN "propertyId" TEXT;
ALTER TABLE "FrictionEvent" ADD COLUMN "propertyId" TEXT;
ALTER TABLE "PerformanceMetric" ADD COLUMN "propertyId" TEXT;
ALTER TABLE "ErrorLog" ADD COLUMN "propertyId" TEXT;
ALTER TABLE "SessionRecording" ADD COLUMN "propertyId" TEXT;

ALTER TABLE "AnalyticsProperty"
  ADD CONSTRAINT "AnalyticsProperty_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ApiKey"
  ADD CONSTRAINT "ApiKey_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "AnalyticsProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FrictionEvent"
  ADD CONSTRAINT "FrictionEvent_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "AnalyticsProperty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PerformanceMetric"
  ADD CONSTRAINT "PerformanceMetric_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "AnalyticsProperty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ErrorLog"
  ADD CONSTRAINT "ErrorLog_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "AnalyticsProperty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SessionRecording"
  ADD CONSTRAINT "SessionRecording_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "AnalyticsProperty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "AnalyticsProperty_userId_createdAt_idx"
  ON "AnalyticsProperty"("userId", "createdAt");

CREATE INDEX "AnalyticsProperty_userId_environment_idx"
  ON "AnalyticsProperty"("userId", "environment");

CREATE INDEX "ApiKey_propertyId_isActive_idx"
  ON "ApiKey"("propertyId", "isActive");

CREATE INDEX "FrictionEvent_propertyId_createdAt_idx"
  ON "FrictionEvent"("propertyId", "createdAt");

CREATE INDEX "PerformanceMetric_propertyId_createdAt_idx"
  ON "PerformanceMetric"("propertyId", "createdAt");

CREATE INDEX "ErrorLog_propertyId_createdAt_idx"
  ON "ErrorLog"("propertyId", "createdAt");

CREATE INDEX "SessionRecording_propertyId_createdAt_idx"
  ON "SessionRecording"("propertyId", "createdAt" DESC);

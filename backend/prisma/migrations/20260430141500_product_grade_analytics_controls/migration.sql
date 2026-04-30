CREATE TABLE "PrivacySetting" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "propertyId" TEXT,
  "retentionDays" INTEGER NOT NULL DEFAULT 90,
  "autoCleanup" BOOLEAN NOT NULL DEFAULT true,
  "archiveBeforeDelete" BOOLEAN NOT NULL DEFAULT false,
  "redactText" BOOLEAN NOT NULL DEFAULT true,
  "respectDoNotTrack" BOOLEAN NOT NULL DEFAULT true,
  "requireConsent" BOOLEAN NOT NULL DEFAULT false,
  "captureQueryString" BOOLEAN NOT NULL DEFAULT false,
  "captureUrlHash" BOOLEAN NOT NULL DEFAULT false,
  "allowScreenshots" BOOLEAN NOT NULL DEFAULT false,
  "recordingSampleRate" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
  "domainAllowlist" JSONB NOT NULL DEFAULT '[]',
  "sensitiveSelectors" JSONB NOT NULL DEFAULT '["[data-nudgr-redact]","[data-private]","[data-sensitive]"]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PrivacySetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventDefinition" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "propertyId" TEXT,
  "eventName" TEXT NOT NULL,
  "displayName" TEXT,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'custom',
  "status" TEXT NOT NULL DEFAULT 'active',
  "owner" TEXT,
  "requiredProperties" JSONB NOT NULL DEFAULT '[]',
  "optionalProperties" JSONB NOT NULL DEFAULT '[]',
  "conversionEvent" BOOLEAN NOT NULL DEFAULT false,
  "piiRisk" TEXT NOT NULL DEFAULT 'low',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EventDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExportDestination" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "destinationType" TEXT NOT NULL,
  "cadence" TEXT NOT NULL DEFAULT 'manual',
  "config" JSONB NOT NULL DEFAULT '{}',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastRunAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ExportDestination_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PrivacySetting_userId_propertyId_key" ON "PrivacySetting"("userId", "propertyId");
CREATE INDEX "PrivacySetting_userId_idx" ON "PrivacySetting"("userId");
CREATE INDEX "PrivacySetting_propertyId_idx" ON "PrivacySetting"("propertyId");
CREATE UNIQUE INDEX "EventDefinition_userId_propertyId_eventName_key" ON "EventDefinition"("userId", "propertyId", "eventName");
CREATE INDEX "EventDefinition_userId_status_idx" ON "EventDefinition"("userId", "status");
CREATE INDEX "EventDefinition_propertyId_status_idx" ON "EventDefinition"("propertyId", "status");
CREATE INDEX "ExportDestination_userId_isActive_idx" ON "ExportDestination"("userId", "isActive");
CREATE INDEX "ExportDestination_destinationType_idx" ON "ExportDestination"("destinationType");
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

ALTER TABLE "PrivacySetting"
  ADD CONSTRAINT "PrivacySetting_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PrivacySetting"
  ADD CONSTRAINT "PrivacySetting_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "AnalyticsProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventDefinition"
  ADD CONSTRAINT "EventDefinition_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventDefinition"
  ADD CONSTRAINT "EventDefinition_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "AnalyticsProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExportDestination"
  ADD CONSTRAINT "ExportDestination_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

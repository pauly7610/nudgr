-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalAuthAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "email" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsProperty" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL DEFAULT 'website',
    "environment" TEXT NOT NULL DEFAULT 'production',
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT,
    "keyName" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowedDomains" JSONB NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usageType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageLimit" (
    "id" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "usageType" TEXT NOT NULL,
    "includedAmount" INTEGER NOT NULL,
    "overagePrice" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrictionEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "propertyId" TEXT,
    "eventType" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "severityScore" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FrictionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "propertyId" TEXT,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "pageUrl" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "propertyId" TEXT,
    "errorType" TEXT NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "errorStack" TEXT,
    "componentName" TEXT,
    "pageUrl" TEXT,
    "userAgent" TEXT,
    "severity" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeatmapData" (
    "id" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "elementSelector" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL,
    "xPosition" INTEGER,
    "yPosition" INTEGER,
    "viewportWidth" INTEGER,
    "viewportHeight" INTEGER,
    "interactionCount" INTEGER NOT NULL DEFAULT 1,
    "totalDurationMs" INTEGER NOT NULL DEFAULT 0,
    "avgDurationMs" INTEGER,
    "frictionScore" INTEGER NOT NULL DEFAULT 0,
    "dateBucket" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeatmapData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrollDepthAnalytics" (
    "id" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "maxScrollPercentage" INTEGER NOT NULL,
    "avgScrollPercentage" INTEGER NOT NULL,
    "bounceAtPercentage" INTEGER,
    "totalSessions" INTEGER NOT NULL DEFAULT 1,
    "dateBucket" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrollDepthAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagePerformanceMetric" (
    "id" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "avgLoadTimeMs" INTEGER,
    "avgTimeToInteractiveMs" INTEGER,
    "avgFirstContentfulPaintMs" INTEGER,
    "totalPageViews" INTEGER NOT NULL DEFAULT 1,
    "bounceRate" DECIMAL(65,30),
    "avgTimeOnPageSeconds" INTEGER,
    "exitRate" DECIMAL(65,30),
    "dateBucket" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagePerformanceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormAnalytics" (
    "id" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "formSelector" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldType" TEXT,
    "totalInteractions" INTEGER NOT NULL DEFAULT 0,
    "totalErrors" INTEGER NOT NULL DEFAULT 0,
    "errorRate" DECIMAL(65,30),
    "avgTimeToCompleteMs" INTEGER,
    "abandonmentCount" INTEGER NOT NULL DEFAULT 0,
    "abandonmentRate" DECIMAL(65,30),
    "commonErrorMessages" JSONB,
    "dateBucket" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "layout" JSONB NOT NULL,
    "filters" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "sharedWithRoles" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "alertType" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "notificationChannels" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbTest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "variants" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamOwnerId" TEXT NOT NULL,
    "memberEmail" TEXT NOT NULL,
    "memberUserId" TEXT,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionRecording" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "sessionId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "durationSeconds" INTEGER,
    "fileSizeBytes" BIGINT,
    "recordingStart" TIMESTAMP(3) NOT NULL,
    "recordingEnd" TIMESTAMP(3),
    "frictionEventsCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionRecording_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exportType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "storagePath" TEXT,
    "parameters" JSONB NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ExportJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "alertId" TEXT,
    "notificationType" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventName" TEXT NOT NULL,
    "eventProperties" JSONB NOT NULL,
    "pageUrl" TEXT,
    "sessionId" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "ExternalAuthAccount_userId_idx" ON "ExternalAuthAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalAuthAccount_provider_providerAccountId_key" ON "ExternalAuthAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "AnalyticsProperty_userId_createdAt_idx" ON "AnalyticsProperty"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsProperty_userId_environment_idx" ON "AnalyticsProperty"("userId", "environment");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_userId_isActive_idx" ON "ApiKey"("userId", "isActive");

-- CreateIndex
CREATE INDEX "ApiKey_propertyId_isActive_idx" ON "ApiKey"("propertyId", "isActive");

-- CreateIndex
CREATE INDEX "UsageRecord_userId_usageType_periodStart_idx" ON "UsageRecord"("userId", "usageType", "periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "UsageLimit_tier_usageType_key" ON "UsageLimit"("tier", "usageType");

-- CreateIndex
CREATE INDEX "FrictionEvent_eventType_createdAt_idx" ON "FrictionEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "FrictionEvent_userId_createdAt_idx" ON "FrictionEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "FrictionEvent_propertyId_createdAt_idx" ON "FrictionEvent"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "PerformanceMetric_metricName_createdAt_idx" ON "PerformanceMetric"("metricName", "createdAt");

-- CreateIndex
CREATE INDEX "PerformanceMetric_propertyId_createdAt_idx" ON "PerformanceMetric"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "ErrorLog_severity_createdAt_idx" ON "ErrorLog"("severity", "createdAt");

-- CreateIndex
CREATE INDEX "ErrorLog_propertyId_createdAt_idx" ON "ErrorLog"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "RateLimit_identifier_endpoint_idx" ON "RateLimit"("identifier", "endpoint");

-- CreateIndex
CREATE INDEX "RateLimit_windowStart_idx" ON "RateLimit"("windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_identifier_endpoint_key" ON "RateLimit"("identifier", "endpoint");

-- CreateIndex
CREATE INDEX "HeatmapData_pageUrl_idx" ON "HeatmapData"("pageUrl");

-- CreateIndex
CREATE INDEX "HeatmapData_dateBucket_idx" ON "HeatmapData"("dateBucket");

-- CreateIndex
CREATE INDEX "HeatmapData_interactionType_idx" ON "HeatmapData"("interactionType");

-- CreateIndex
CREATE INDEX "HeatmapData_frictionScore_idx" ON "HeatmapData"("frictionScore");

-- CreateIndex
CREATE UNIQUE INDEX "HeatmapData_pageUrl_elementSelector_interactionType_dateBuc_key" ON "HeatmapData"("pageUrl", "elementSelector", "interactionType", "dateBucket");

-- CreateIndex
CREATE INDEX "ScrollDepthAnalytics_pageUrl_idx" ON "ScrollDepthAnalytics"("pageUrl");

-- CreateIndex
CREATE INDEX "ScrollDepthAnalytics_dateBucket_idx" ON "ScrollDepthAnalytics"("dateBucket");

-- CreateIndex
CREATE INDEX "PagePerformanceMetric_pageUrl_idx" ON "PagePerformanceMetric"("pageUrl");

-- CreateIndex
CREATE INDEX "PagePerformanceMetric_dateBucket_idx" ON "PagePerformanceMetric"("dateBucket");

-- CreateIndex
CREATE INDEX "FormAnalytics_pageUrl_idx" ON "FormAnalytics"("pageUrl");

-- CreateIndex
CREATE INDEX "FormAnalytics_errorRate_idx" ON "FormAnalytics"("errorRate");

-- CreateIndex
CREATE INDEX "FormAnalytics_dateBucket_idx" ON "FormAnalytics"("dateBucket");

-- CreateIndex
CREATE INDEX "DashboardConfig_userId_idx" ON "DashboardConfig"("userId");

-- CreateIndex
CREATE INDEX "DashboardConfig_isDefault_idx" ON "DashboardConfig"("isDefault");

-- CreateIndex
CREATE INDEX "AlertConfig_userId_idx" ON "AlertConfig"("userId");

-- CreateIndex
CREATE INDEX "AlertConfig_isActive_idx" ON "AlertConfig"("isActive");

-- CreateIndex
CREATE INDEX "AbTest_userId_idx" ON "AbTest"("userId");

-- CreateIndex
CREATE INDEX "TeamMember_teamOwnerId_idx" ON "TeamMember"("teamOwnerId");

-- CreateIndex
CREATE INDEX "TeamMember_memberUserId_idx" ON "TeamMember"("memberUserId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamOwnerId_memberEmail_key" ON "TeamMember"("teamOwnerId", "memberEmail");

-- CreateIndex
CREATE INDEX "SessionRecording_sessionId_idx" ON "SessionRecording"("sessionId");

-- CreateIndex
CREATE INDEX "SessionRecording_propertyId_createdAt_idx" ON "SessionRecording"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "SessionRecording_createdAt_idx" ON "SessionRecording"("createdAt");

-- CreateIndex
CREATE INDEX "ExportJob_userId_idx" ON "ExportJob"("userId");

-- CreateIndex
CREATE INDEX "ExportJob_status_idx" ON "ExportJob"("status");

-- CreateIndex
CREATE INDEX "ExportJob_createdAt_idx" ON "ExportJob"("createdAt");

-- CreateIndex
CREATE INDEX "NotificationLog_alertId_idx" ON "NotificationLog"("alertId");

-- CreateIndex
CREATE INDEX "NotificationLog_createdAt_idx" ON "NotificationLog"("createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventName_idx" ON "AnalyticsEvent"("eventName");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAuthAccount" ADD CONSTRAINT "ExternalAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsProperty" ADD CONSTRAINT "AnalyticsProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "AnalyticsProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrictionEvent" ADD CONSTRAINT "FrictionEvent_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "AnalyticsProperty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceMetric" ADD CONSTRAINT "PerformanceMetric_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "AnalyticsProperty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "AnalyticsProperty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardConfig" ADD CONSTRAINT "DashboardConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertConfig" ADD CONSTRAINT "AlertConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbTest" ADD CONSTRAINT "AbTest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamOwnerId_fkey" FOREIGN KEY ("teamOwnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_memberUserId_fkey" FOREIGN KEY ("memberUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionRecording" ADD CONSTRAINT "SessionRecording_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "AnalyticsProperty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportJob" ADD CONSTRAINT "ExportJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "AlertConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


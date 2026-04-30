ALTER TABLE "FrictionEvent" ADD COLUMN "eventId" TEXT;
ALTER TABLE "FrictionEvent" ADD COLUMN "eventTimestamp" TIMESTAMP(3);
ALTER TABLE "FrictionEvent" ADD COLUMN "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "FrictionEvent" ADD COLUMN "source" TEXT;
ALTER TABLE "FrictionEvent" ADD COLUMN "schemaVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "FrictionEvent" ADD COLUMN "sdkVersion" TEXT;
ALTER TABLE "FrictionEvent" ADD COLUMN "urlHost" TEXT;
ALTER TABLE "FrictionEvent" ADD COLUMN "urlPath" TEXT;

CREATE UNIQUE INDEX "FrictionEvent_propertyId_eventId_key" ON "FrictionEvent"("propertyId", "eventId");
CREATE INDEX "FrictionEvent_propertyId_eventTimestamp_idx" ON "FrictionEvent"("propertyId", "eventTimestamp");
CREATE INDEX "FrictionEvent_propertyId_eventId_idx" ON "FrictionEvent"("propertyId", "eventId");

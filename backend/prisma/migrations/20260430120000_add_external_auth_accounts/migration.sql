-- Provider account links for OAuth sign-in.

CREATE TABLE "ExternalAuthAccount" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "email" TEXT,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ExternalAuthAccount_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ExternalAuthAccount"
  ADD CONSTRAINT "ExternalAuthAccount_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "ExternalAuthAccount_provider_providerAccountId_key"
  ON "ExternalAuthAccount"("provider", "providerAccountId");

CREATE INDEX "ExternalAuthAccount_userId_idx"
  ON "ExternalAuthAccount"("userId");

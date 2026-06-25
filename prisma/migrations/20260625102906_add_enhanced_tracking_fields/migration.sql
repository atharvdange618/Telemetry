-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "browserVersion" TEXT,
ADD COLUMN     "cls" DOUBLE PRECISION,
ADD COLUMN     "fcp" DOUBLE PRECISION,
ADD COLUMN     "fid" DOUBLE PRECISION,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "lcp" DOUBLE PRECISION,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "osVersion" TEXT,
ADD COLUMN     "outboundDomain" TEXT,
ADD COLUMN     "outboundUrl" TEXT,
ADD COLUMN     "properties" JSONB,
ADD COLUMN     "scrollDepth" INTEGER,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "ttfb" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Event_tenantId_browser_idx" ON "public"."Event"("tenantId", "browser");

-- CreateIndex
CREATE INDEX "Event_tenantId_os_idx" ON "public"."Event"("tenantId", "os");

-- CreateIndex
CREATE INDEX "Event_tenantId_language_idx" ON "public"."Event"("tenantId", "language");

-- CreateIndex
CREATE INDEX "Event_tenantId_sessionId_idx" ON "public"."Event"("tenantId", "sessionId");

-- CreateIndex
CREATE INDEX "Event_tenantId_createdAt_visitorId_idx" ON "public"."Event"("tenantId", "createdAt", "visitorId");

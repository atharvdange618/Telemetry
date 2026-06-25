-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN "apiKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_apiKey_key" ON "Tenant"("apiKey");

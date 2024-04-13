-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "companyDataId" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "client_companyDataId_index" ON "Client"("companyDataId");

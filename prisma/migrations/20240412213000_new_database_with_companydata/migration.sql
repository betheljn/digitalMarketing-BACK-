/*
  Warnings:

  - You are about to drop the column `addressId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_addressId_fkey";

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_companyId_fkey";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "addressId",
DROP COLUMN "companyId",
ADD COLUMN     "companyDataId" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "Company";

-- CreateTable
CREATE TABLE "CompanyData" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "foundedYear" INTEGER,
    "revenue" DOUBLE PRECISION,
    "description" TEXT,
    "services" TEXT[],
    "budget" DOUBLE PRECISION,
    "marketingChannels" TEXT[],
    "targetAudience" TEXT,
    "competitors" TEXT[],

    CONSTRAINT "CompanyData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_companyDataId_fkey" FOREIGN KEY ("companyDataId") REFERENCES "CompanyData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - Made the column `phone` on table `Contact` required. This step will fail if there are existing NULL values in that column.
  - Made the column `message` on table `Contact` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "message" SET NOT NULL,
ALTER COLUMN "adminNotes" DROP NOT NULL;

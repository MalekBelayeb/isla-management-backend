/*
  Warnings:

  - The `nationality` column on the `Tenant` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "nationality",
ADD COLUMN     "nationality" TEXT NOT NULL DEFAULT 'tn';

/*
  Warnings:

  - You are about to alter the column `tva` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(65,30)`.
  - The `nationality` column on the `Tenant` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TenantType" AS ENUM ('natural', 'legal');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "extraCharge" DECIMAL(65,30) NOT NULL DEFAULT 0,
ALTER COLUMN "tva" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "managerCin" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "managerFirstname" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "managerLastname" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "managerPhoneNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "societyName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "type" "TenantType" NOT NULL DEFAULT 'natural',
ALTER COLUMN "firstname" SET DEFAULT '',
ALTER COLUMN "lastname" SET DEFAULT '',
ALTER COLUMN "cin" SET DEFAULT '',
ALTER COLUMN "phoneNumber" SET DEFAULT '',
DROP COLUMN "nationality",
ADD COLUMN     "nationality" "NationalityType" NOT NULL DEFAULT 'tn';

-- CreateIndex
CREATE INDEX "Agreement_apartmentId_idx" ON "Agreement"("apartmentId");

-- CreateIndex
CREATE INDEX "Agreement_tenantId_idx" ON "Agreement"("tenantId");

-- CreateIndex
CREATE INDEX "Agreement_status_idx" ON "Agreement"("status");

-- CreateIndex
CREATE INDEX "Agreement_isArchived_idx" ON "Agreement"("isArchived");

-- CreateIndex
CREATE INDEX "Agreement_createdAt_idx" ON "Agreement"("createdAt");

-- CreateIndex
CREATE INDEX "Apartment_propertyId_idx" ON "Apartment"("propertyId");

-- CreateIndex
CREATE INDEX "Apartment_type_idx" ON "Apartment"("type");

-- CreateIndex
CREATE INDEX "Apartment_matricule_idx" ON "Apartment"("matricule");

-- CreateIndex
CREATE INDEX "Apartment_isArchived_idx" ON "Apartment"("isArchived");

-- CreateIndex
CREATE INDEX "Apartment_createdAt_idx" ON "Apartment"("createdAt");

-- CreateIndex
CREATE INDEX "Owner_email_idx" ON "Owner"("email");

-- CreateIndex
CREATE INDEX "Owner_cin_idx" ON "Owner"("cin");

-- CreateIndex
CREATE INDEX "Owner_matricule_idx" ON "Owner"("matricule");

-- CreateIndex
CREATE INDEX "Owner_isArchived_idx" ON "Owner"("isArchived");

-- CreateIndex
CREATE INDEX "Payment_propertyId_idx" ON "Payment"("propertyId");

-- CreateIndex
CREATE INDEX "Payment_apartmentId_idx" ON "Payment"("apartmentId");

-- CreateIndex
CREATE INDEX "Payment_tenantId_idx" ON "Payment"("tenantId");

-- CreateIndex
CREATE INDEX "Payment_agreementId_idx" ON "Payment"("agreementId");

-- CreateIndex
CREATE INDEX "Payment_paymentDate_idx" ON "Payment"("paymentDate");

-- CreateIndex
CREATE INDEX "Payment_category_idx" ON "Payment"("category");

-- CreateIndex
CREATE INDEX "Payment_type_idx" ON "Payment"("type");

-- CreateIndex
CREATE INDEX "Payment_isArchived_idx" ON "Payment"("isArchived");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Property_ownerId_idx" ON "Property"("ownerId");

-- CreateIndex
CREATE INDEX "Property_type_idx" ON "Property"("type");

-- CreateIndex
CREATE INDEX "Property_matricule_idx" ON "Property"("matricule");

-- CreateIndex
CREATE INDEX "Property_isArchived_idx" ON "Property"("isArchived");

-- CreateIndex
CREATE INDEX "Property_createdAt_idx" ON "Property"("createdAt");

-- CreateIndex
CREATE INDEX "Tenant_email_idx" ON "Tenant"("email");

-- CreateIndex
CREATE INDEX "Tenant_cin_idx" ON "Tenant"("cin");

-- CreateIndex
CREATE INDEX "Tenant_matricule_idx" ON "Tenant"("matricule");

-- CreateIndex
CREATE INDEX "Tenant_isArchived_idx" ON "Tenant"("isArchived");

-- CreateIndex
CREATE INDEX "Tenant_createdAt_idx" ON "Tenant"("createdAt");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isArchived_idx" ON "User"("isArchived");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

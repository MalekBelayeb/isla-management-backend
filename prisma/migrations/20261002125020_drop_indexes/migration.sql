/*
  Warnings:

  - You are about to drop the column `extraCharge` on the `Payment` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Agreement_apartmentId_idx";

-- DropIndex
DROP INDEX "Agreement_createdAt_idx";

-- DropIndex
DROP INDEX "Agreement_isArchived_idx";

-- DropIndex
DROP INDEX "Agreement_status_idx";

-- DropIndex
DROP INDEX "Agreement_tenantId_idx";

-- DropIndex
DROP INDEX "Apartment_createdAt_idx";

-- DropIndex
DROP INDEX "Apartment_isArchived_idx";

-- DropIndex
DROP INDEX "Apartment_matricule_idx";

-- DropIndex
DROP INDEX "Apartment_propertyId_idx";

-- DropIndex
DROP INDEX "Apartment_type_idx";

-- DropIndex
DROP INDEX "Owner_cin_idx";

-- DropIndex
DROP INDEX "Owner_email_idx";

-- DropIndex
DROP INDEX "Owner_isArchived_idx";

-- DropIndex
DROP INDEX "Owner_matricule_idx";

-- DropIndex
DROP INDEX "Payment_agreementId_idx";

-- DropIndex
DROP INDEX "Payment_apartmentId_idx";

-- DropIndex
DROP INDEX "Payment_category_idx";

-- DropIndex
DROP INDEX "Payment_createdAt_idx";

-- DropIndex
DROP INDEX "Payment_isArchived_idx";

-- DropIndex
DROP INDEX "Payment_paymentDate_idx";

-- DropIndex
DROP INDEX "Payment_propertyId_idx";

-- DropIndex
DROP INDEX "Payment_tenantId_idx";

-- DropIndex
DROP INDEX "Payment_type_idx";

-- DropIndex
DROP INDEX "Property_createdAt_idx";

-- DropIndex
DROP INDEX "Property_isArchived_idx";

-- DropIndex
DROP INDEX "Property_matricule_idx";

-- DropIndex
DROP INDEX "Property_ownerId_idx";

-- DropIndex
DROP INDEX "Property_type_idx";

-- DropIndex
DROP INDEX "Tenant_cin_idx";

-- DropIndex
DROP INDEX "Tenant_createdAt_idx";

-- DropIndex
DROP INDEX "Tenant_email_idx";

-- DropIndex
DROP INDEX "Tenant_isArchived_idx";

-- DropIndex
DROP INDEX "Tenant_matricule_idx";

-- DropIndex
DROP INDEX "User_createdAt_idx";

-- DropIndex
DROP INDEX "User_isArchived_idx";

-- DropIndex
DROP INDEX "User_role_idx";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "extraCharge",
ALTER COLUMN "tva" SET DATA TYPE DECIMAL;

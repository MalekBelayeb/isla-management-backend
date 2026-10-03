/*
  Warnings:

  - You are about to drop the column `extraCharge` on the `Payment` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX IF EXISTS "Agreement_apartmentId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Agreement_createdAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "Agreement_isArchived_idx";

-- DropIndex
DROP INDEX IF EXISTS "Agreement_status_idx";

-- DropIndex
DROP INDEX IF EXISTS "Agreement_tenantId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Apartment_createdAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "Apartment_isArchived_idx";

-- DropIndex
DROP INDEX IF EXISTS "Apartment_matricule_idx";

-- DropIndex
DROP INDEX IF EXISTS "Apartment_propertyId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Apartment_type_idx";

-- DropIndex
DROP INDEX IF EXISTS "Owner_cin_idx";

-- DropIndex
DROP INDEX IF EXISTS "Owner_email_idx";

-- DropIndex
DROP INDEX IF EXISTS "Owner_isArchived_idx";

-- DropIndex
DROP INDEX IF EXISTS "Owner_matricule_idx";

-- DropIndex
DROP INDEX IF EXISTS "Payment_agreementId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Payment_apartmentId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Payment_category_idx";

-- DropIndex
DROP INDEX IF EXISTS "Payment_createdAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "Payment_isArchived_idx";

-- DropIndex
DROP INDEX IF EXISTS "Payment_paymentDate_idx";

-- DropIndex
DROP INDEX IF EXISTS "Payment_propertyId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Payment_tenantId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Payment_type_idx";

-- DropIndex
DROP INDEX IF EXISTS "Property_createdAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "Property_isArchived_idx";

-- DropIndex
DROP INDEX IF EXISTS "Property_matricule_idx";

-- DropIndex
DROP INDEX IF EXISTS "Property_ownerId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Property_type_idx";

-- DropIndex
DROP INDEX IF EXISTS "Tenant_cin_idx";

-- DropIndex
DROP INDEX IF EXISTS "Tenant_createdAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "Tenant_email_idx";

-- DropIndex
DROP INDEX IF EXISTS "Tenant_isArchived_idx";

-- DropIndex
DROP INDEX IF EXISTS "Tenant_matricule_idx";

-- DropIndex
DROP INDEX IF EXISTS "User_createdAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "User_isArchived_idx";

-- DropIndex
DROP INDEX IF EXISTS "User_role_idx";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "extraCharge",
ALTER COLUMN "tva" SET DATA TYPE DECIMAL;

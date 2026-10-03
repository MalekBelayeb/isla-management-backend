-- CreateEnum
CREATE TYPE "Role" AS ENUM ('agent', 'admin');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('natural', 'legal');

-- CreateEnum
CREATE TYPE "NationalityType" AS ENUM ('tn', 'dz', 'ly', 'others');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('immeuble', 'appartement', 'magasin', 'depot', 'studio', 'villa', 'duplex', 'terrain', 'fond_de_commerce', 'usine');

-- CreateEnum
CREATE TYPE "ApartmentType" AS ENUM ('appartement', 'studio', 'cave', 'etage_de_villa', 'magasin', 'depot');

-- CreateEnum
CREATE TYPE "GenderType" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "PaymentMethodType" AS ENUM ('cash', 'check', 'transfer');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('income', 'expense', 'expense_agency');

-- CreateEnum
CREATE TYPE "PaymentCategory" AS ENUM ('rent', 'deposit', 'agency_fees', 'maintenance_fees', 'utility_payments', 'cleaning_fees', 'furniture_rental_fees', 'home_insurance_payment', 'others');

-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('DAILY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'agent',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "matricule" SERIAL NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "fullname" TEXT,
    "gender" "GenderType" DEFAULT 'M',
    "cin" TEXT,
    "email" TEXT,
    "nationality" "NationalityType" NOT NULL DEFAULT 'tn',
    "phoneNumber" TEXT NOT NULL,
    "rib" TEXT NOT NULL,
    "society" TEXT,
    "taxId" TEXT,
    "type" "OwnerType" NOT NULL DEFAULT 'natural',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "bank" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "matricule" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "type" "PropertyType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "profitInPercentage" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Apartment" (
    "id" TEXT NOT NULL,
    "matricule" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "type" "ApartmentType" NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rooms" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "Apartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "matricule" SERIAL NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "fullname" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "gender" "GenderType" NOT NULL DEFAULT 'M',
    "cin" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "job" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agreement" (
    "id" TEXT NOT NULL,
    "matricule" SERIAL NOT NULL,
    "rentAmount" DECIMAL(65,30) NOT NULL,
    "nbDaysOfTolerance" INTEGER NOT NULL DEFAULT 10,
    "deposit" DECIMAL(65,30),
    "firstDayOfPayment" TIMESTAMP(3),
    "paymentFrequency" "PaymentFrequency" NOT NULL DEFAULT 'MONTHLY',
    "startDate" TIMESTAMP(3) NOT NULL,
    "signedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "terminatedAt" TIMESTAMP(3),
    "terminationReason" TEXT,
    "status" "AgreementStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "documentUrl" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apartmentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "extraCharge" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "initialAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "PaymentCategory" NOT NULL DEFAULT 'others',
    "type" "PaymentType" NOT NULL,
    "method" "PaymentMethodType" NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "rentStartDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "rentEndDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "propertyId" TEXT,
    "tva" DECIMAL(65,30) DEFAULT 19,
    "bank" TEXT,
    "checkNumber" TEXT,
    "transferNumber" TEXT,
    "agreementId" TEXT,
    "apartmentId" TEXT,
    "tenantId" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isArchived_idx" ON "User"("isArchived");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "Owner_email_idx" ON "Owner"("email");

-- CreateIndex
CREATE INDEX "Owner_cin_idx" ON "Owner"("cin");

-- CreateIndex
CREATE INDEX "Owner_matricule_idx" ON "Owner"("matricule");

-- CreateIndex
CREATE INDEX "Owner_isArchived_idx" ON "Owner"("isArchived");

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

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

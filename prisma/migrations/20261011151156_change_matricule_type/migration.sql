-- AlterTable
ALTER TABLE "Apartment" ALTER COLUMN "matricule" SET DEFAULT '',
ALTER COLUMN "matricule" DROP DEFAULT,
ALTER COLUMN "matricule" SET DATA TYPE TEXT;
DROP SEQUENCE "Apartment_matricule_seq";

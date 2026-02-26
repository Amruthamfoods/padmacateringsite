-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('GATE', 'DOORSTEP', 'DOORSTEP_SERVICE');

-- CreateEnum
CREATE TYPE "DietPreference" AS ENUM ('VEG', 'NON_VEG', 'SEPARATE');

-- CreateEnum
CREATE TYPE "SpiceLevel" AS ENUM ('MILD', 'MEDIUM', 'SPICY');

-- CreateEnum
CREATE TYPE "PaymentPlan" AS ENUM ('FULL', 'ADVANCE');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "addonCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryType" "DeliveryType" NOT NULL DEFAULT 'GATE',
ADD COLUMN     "dietPreference" "DietPreference" NOT NULL DEFAULT 'NON_VEG',
ADD COLUMN     "nonVegCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paymentPlan" "PaymentPlan" NOT NULL DEFAULT 'FULL',
ADD COLUMN     "spiceLevel" "SpiceLevel" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "staffCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "staffCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timeSlot" TEXT,
ADD COLUMN     "vegCount" INTEGER NOT NULL DEFAULT 0;

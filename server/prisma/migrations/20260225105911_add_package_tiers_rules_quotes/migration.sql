-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'REVIEWED', 'QUOTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "packageId" INTEGER;

-- CreateTable
CREATE TABLE "PackagePricingTier" (
    "id" SERIAL NOT NULL,
    "packageId" INTEGER NOT NULL,
    "minGuests" INTEGER NOT NULL,
    "maxGuests" INTEGER,
    "pricePerPerson" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PackagePricingTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageCategoryRule" (
    "id" SERIAL NOT NULL,
    "packageId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "minChoices" INTEGER NOT NULL DEFAULT 1,
    "maxChoices" INTEGER NOT NULL,

    CONSTRAINT "PackageCategoryRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "venueAddress" TEXT,
    "servingStyle" "ServingStyle" NOT NULL,
    "specialInstructions" TEXT,
    "selectedItemsJson" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PackagePricingTier" ADD CONSTRAINT "PackagePricingTier_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "MenuPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageCategoryRule" ADD CONSTRAINT "PackageCategoryRule_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "MenuPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageCategoryRule" ADD CONSTRAINT "PackageCategoryRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MenuCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

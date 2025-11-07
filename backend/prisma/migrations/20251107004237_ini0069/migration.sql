/*
  Warnings:

  - Added the required column `totalAfiliationsPurchase` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "totalAfiliations" INTEGER,
ADD COLUMN     "totalAfiliationsPurchase" INTEGER NOT NULL,
ALTER COLUMN "totalPurchase" DROP DEFAULT,
ALTER COLUMN "percentShare" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "totalAfiliateGain" INTEGER,
ADD COLUMN     "totalAfiliateMade" INTEGER,
ADD COLUMN     "totalAfiliates" INTEGER,
ADD COLUMN     "totalAfiliations" INTEGER;

-- AddForeignKey
ALTER TABLE "Afiliates" ADD CONSTRAINT "Afiliates_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Afiliates" ADD CONSTRAINT "Afiliates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

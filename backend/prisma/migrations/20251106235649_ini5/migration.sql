-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "percentShare" INTEGER DEFAULT 0,
ADD COLUMN     "totalAfiliates" INTEGER DEFAULT 0,
ADD COLUMN     "totalPurchasedAfiliates" INTEGER DEFAULT 0,
ALTER COLUMN "totalPurchase" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "totalAfiliates" INTEGER DEFAULT 0,
ADD COLUMN     "totalAfiliations" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "Afiliates" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "totalSells" INTEGER NOT NULL DEFAULT 0,
    "totalPurchases" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Afiliates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Afiliates" ADD CONSTRAINT "Afiliates_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Afiliates" ADD CONSTRAINT "Afiliates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

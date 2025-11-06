/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Coupon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "expiresAt",
ALTER COLUMN "minPurchase" SET DEFAULT 0,
ALTER COLUMN "maxUsage" SET DEFAULT 0;

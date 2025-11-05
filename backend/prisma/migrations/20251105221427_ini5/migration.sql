/*
  Warnings:

  - You are about to drop the column `totalPurchase` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "totalPurchase";

-- AlterTable
ALTER TABLE "Products" ADD COLUMN     "totalPurchase" INTEGER NOT NULL DEFAULT 0;

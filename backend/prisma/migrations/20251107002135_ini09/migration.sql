/*
  Warnings:

  - You are about to drop the column `totalAfiliates` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `totalPurchasedAfiliates` on the `Products` table. All the data in the column will be lost.
  - You are about to drop the column `totalAfiliates` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `totalAfiliations` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Products" DROP COLUMN "totalAfiliates",
DROP COLUMN "totalPurchasedAfiliates";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "totalAfiliates",
DROP COLUMN "totalAfiliations";

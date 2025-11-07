/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId]` on the table `Afiliates` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Afiliates" DROP CONSTRAINT "Afiliates_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Afiliates" DROP CONSTRAINT "Afiliates_userId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Afiliates_userId_productId_key" ON "Afiliates"("userId", "productId");

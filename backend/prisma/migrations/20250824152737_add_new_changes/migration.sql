/*
  Warnings:

  - You are about to drop the column `events` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `payments` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `product` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Withdrawal` table. All the data in the column will be lost.
  - You are about to drop the `Stats` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[order]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paypayCode]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userid` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userid` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Withdrawal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "public"."Status" ADD VALUE 'BANED';

-- DropForeignKey
ALTER TABLE "public"."Stats" DROP CONSTRAINT "Stats_userid_fkey";

-- DropIndex
DROP INDEX "public"."Integration_userid_platform_key";

-- DropIndex
DROP INDEX "public"."Payment_id_key";

-- AlterTable
ALTER TABLE "public"."Integration" DROP COLUMN "events",
DROP COLUMN "payments",
ALTER COLUMN "platform" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."Offer" ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "userid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "id",
DROP COLUMN "product",
ADD COLUMN     "order" SERIAL NOT NULL,
ADD COLUMN     "orderbumps" TEXT[],
ADD COLUMN     "paypayCode" TEXT,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "products" TEXT[],
ADD COLUMN     "userid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Products" ADD COLUMN     "banner" TEXT,
ADD COLUMN     "cover" TEXT,
ADD COLUMN     "file" TEXT,
ADD COLUMN     "pixelId" TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "orderbumps" SET DATA TYPE TEXT[],
ALTER COLUMN "category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Users" ADD COLUMN     "availableBalance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "withdrawnAmount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Withdrawal" DROP COLUMN "message",
ADD COLUMN     "amount" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."Stats";

-- CreateTable
CREATE TABLE "public"."Settings" (
    "id" TEXT NOT NULL,
    "percent" INTEGER NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ResetPassword" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,

    CONSTRAINT "ResetPassword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_order_key" ON "public"."Payment"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paypayCode_key" ON "public"."Payment"("paypayCode");

-- AddForeignKey
ALTER TABLE "public"."ResetPassword" ADD CONSTRAINT "ResetPassword_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Offer" ADD CONSTRAINT "Offer_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

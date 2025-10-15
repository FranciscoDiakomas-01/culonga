/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "fileURL" TEXT;

-- CreateTable
CREATE TABLE "Bank" (
    "id" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "userid" TEXT NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bank_iban_key" ON "Bank"("iban");

-- CreateIndex
CREATE UNIQUE INDEX "Products_title_key" ON "Products"("title");

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_userid_fkey" FOREIGN KEY ("userid") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

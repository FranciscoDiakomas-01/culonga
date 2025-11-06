-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "Cupon" (
    "id" SERIAL NOT NULL,
    "descount" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cupon_code_key" ON "Cupon"("code");

-- AddForeignKey
ALTER TABLE "Cupon" ADD CONSTRAINT "Cupon_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

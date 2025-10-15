-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('APROVED', 'PENDING', 'REJECTED', 'CANCELED', 'CREATED');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'SELLER');

-- CreateEnum
CREATE TYPE "public"."PayMethod" AS ENUM ('EXPRESS', 'REFERENCE');

-- CreateTable
CREATE TABLE "public"."Users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "profile" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'CREATED',
    "role" "public"."UserRole" NOT NULL DEFAULT 'SELLER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stats" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "alert" TEXT,

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Withdrawal" (
    "id" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "message" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "images" JSONB NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Offer" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Products" (
    "id" TEXT NOT NULL,
    "productid" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "whatsappSuport" TEXT,
    "price" INTEGER NOT NULL,
    "garant" INTEGER NOT NULL DEFAULT 7,
    "orderbumps" INTEGER[],
    "link" TEXT NOT NULL,
    "upsell" TEXT,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payment" INTEGER[],
    "backredirect" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'APROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductCheckout" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "bg" TEXT,
    "textColor" TEXT,
    "timer" JSONB,
    "btn" JSONB NOT NULL,
    "orderbump" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCheckout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "uuid" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "method" "public"."PayMethod" NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" JSONB NOT NULL,
    "product" JSONB NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "deepLink" TEXT,
    "message" TEXT NOT NULL,
    "timestemp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Integration" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'APROVED',
    "platform" JSONB NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "payments" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_telefone_key" ON "public"."Users"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "Stats_userid_title_key" ON "public"."Stats"("userid", "title");

-- CreateIndex
CREATE UNIQUE INDEX "UserVerification_userId_key" ON "public"."UserVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Products_productid_key" ON "public"."Products"("productid");

-- CreateIndex
CREATE UNIQUE INDEX "Products_link_key" ON "public"."Products"("link");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCheckout_productId_key" ON "public"."ProductCheckout"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_id_key" ON "public"."Payment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_userid_platform_key" ON "public"."Integration"("userid", "platform");

-- AddForeignKey
ALTER TABLE "public"."Stats" ADD CONSTRAINT "Stats_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Withdrawal" ADD CONSTRAINT "Withdrawal_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserVerification" ADD CONSTRAINT "UserVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Offer" ADD CONSTRAINT "Offer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Products" ADD CONSTRAINT "Products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductCheckout" ADD CONSTRAINT "ProductCheckout_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Integration" ADD CONSTRAINT "Integration_userid_fkey" FOREIGN KEY ("userid") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

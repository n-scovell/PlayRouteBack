/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'COACH', 'TEAM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('NONE', 'ACTIVE', 'CANCELED', 'PAST_DUE', 'INCOMPLETE', 'TRIALING');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'REFUNDED', 'FAILED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "plan" "Plan" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "stripePaymentId" TEXT,
    "stripeSubscriptionId" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentId_key" ON "Payment"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

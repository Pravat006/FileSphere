/*
  Warnings:

  - You are about to drop the column `trashId` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `file_trash` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fileType` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adminId` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- DropForeignKey
ALTER TABLE "file_trash" DROP CONSTRAINT "file_trash_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_folderId_fkey";

-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_trashId_fkey";

-- DropIndex
DROP INDEX "files_mimeType_idx";

-- DropIndex
DROP INDEX "files_trashId_idx";

-- DropIndex
DROP INDEX "files_type_idx";

-- DropIndex
DROP INDEX "subscription_history_endDate_idx";

-- DropIndex
DROP INDEX "users_email_idx";

-- DropIndex
DROP INDEX "users_firebaseUid_idx";

-- AlterTable
ALTER TABLE "files" DROP COLUMN "trashId",
DROP COLUMN "type",
ADD COLUMN     "fileType" "FileType" NOT NULL,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ALTER COLUMN "size" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "subscription_plans" DROP COLUMN "type",
ADD COLUMN     "adminId" TEXT NOT NULL,
ADD COLUMN     "planType" "Plan" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role";

-- DropTable
DROP TABLE "file_trash";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_razorpayOrderId_key" ON "transactions"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_razorpayPaymentId_key" ON "transactions"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

-- CreateIndex
CREATE INDEX "transactions_ownerId_idx" ON "transactions"("ownerId");

-- CreateIndex
CREATE INDEX "files_ownerId_isInTrash_idx" ON "files"("ownerId", "isInTrash");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_history" ADD CONSTRAINT "subscription_history_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

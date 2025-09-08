/*
  Warnings:

  - You are about to drop the column `plan` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `storageLimit` on the `users` table. All the data in the column will be lost.
  - Added the required column `planId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Plan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "public"."files" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isInTrash" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "originalFolderId" TEXT,
ADD COLUMN     "trashId" TEXT,
ALTER COLUMN "folderId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "plan",
DROP COLUMN "storageLimit",
ADD COLUMN     "planId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."SubscriptionPlan";

-- CreateTable
CREATE TABLE "public"."subscription_plans" (
    "id" TEXT NOT NULL,
    "type" "public"."Plan" NOT NULL DEFAULT 'FREE',
    "price" INTEGER NOT NULL DEFAULT 0,
    "storageLimit" INTEGER NOT NULL DEFAULT 1073741824,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."file_trash" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_trash_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_history_transactionId_key" ON "public"."subscription_history"("transactionId");

-- CreateIndex
CREATE INDEX "subscription_history_userId_idx" ON "public"."subscription_history"("userId");

-- CreateIndex
CREATE INDEX "subscription_history_planId_idx" ON "public"."subscription_history"("planId");

-- CreateIndex
CREATE INDEX "subscription_history_startDate_idx" ON "public"."subscription_history"("startDate");

-- CreateIndex
CREATE INDEX "subscription_history_endDate_idx" ON "public"."subscription_history"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "file_trash_ownerId_key" ON "public"."file_trash"("ownerId");

-- CreateIndex
CREATE INDEX "files_trashId_idx" ON "public"."files"("trashId");

-- CreateIndex
CREATE INDEX "files_mimeType_idx" ON "public"."files"("mimeType");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_trashId_fkey" FOREIGN KEY ("trashId") REFERENCES "public"."file_trash"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_history" ADD CONSTRAINT "subscription_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_history" ADD CONSTRAINT "subscription_history_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."file_trash" ADD CONSTRAINT "file_trash_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

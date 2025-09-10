-- AlterTable
ALTER TABLE "public"."subscription_plans" ALTER COLUMN "storageLimit" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "storageUsed" SET DATA TYPE BIGINT;

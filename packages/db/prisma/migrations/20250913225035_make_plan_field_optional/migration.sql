-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_planId_fkey";

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "planId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "retries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "statusMsg" TEXT;

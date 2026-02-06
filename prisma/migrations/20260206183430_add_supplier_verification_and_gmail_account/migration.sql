-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'BASIC', 'VERIFIED');

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "verification_status" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by" TEXT;

-- CreateTable
CREATE TABLE "gmail_accounts" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'GMAIL',
    "email" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "scope" TEXT,
    "token_type" TEXT,
    "expires_at" TIMESTAMP(3),
    "last_polled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gmail_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gmail_accounts_brand_id_idx" ON "gmail_accounts"("brand_id");

-- CreateIndex
CREATE INDEX "gmail_accounts_email_idx" ON "gmail_accounts"("email");

-- CreateIndex
CREATE INDEX "suppliers_verification_status_idx" ON "suppliers"("verification_status");

-- AddForeignKey
ALTER TABLE "gmail_accounts" ADD CONSTRAINT "gmail_accounts_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

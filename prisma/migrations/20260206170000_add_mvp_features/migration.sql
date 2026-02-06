-- CreateEnum for new verification statuses
DO $$ BEGIN
 CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "VerificationMethod" AS ENUM ('MANUAL', 'API', 'WEB_SCRAPING', 'LIST_MATCHING');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AlterEnum for VerificationStatus
ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'FAILED';
ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'PENDING';

-- AlterTable Brand - Add Gmail OAuth fields
ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "gmail_refresh_token" TEXT;
ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "gmail_token_expiry" TIMESTAMP(3);
ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "gmail_connected_at" TIMESTAMP(3);

-- AlterTable Certification - Add new fields
ALTER TABLE "certifications" ADD COLUMN IF NOT EXISTS "certificate_number" TEXT;
ALTER TABLE "certifications" ADD COLUMN IF NOT EXISTS "document_hash" TEXT;
ALTER TABLE "certifications" ADD COLUMN IF NOT EXISTS "extracted_data" JSONB;
ALTER TABLE "certifications" ADD COLUMN IF NOT EXISTS "extraction_confidence" DOUBLE PRECISION;
ALTER TABLE "certifications" ADD COLUMN IF NOT EXISTS "needs_review" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "certifications" ADD COLUMN IF NOT EXISTS "verification_status" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE "certifications" ADD COLUMN IF NOT EXISTS "verification_method" "VerificationMethod";
ALTER TABLE "certifications" ADD COLUMN IF NOT EXISTS "verification_confidence" DOUBLE PRECISION;
ALTER TABLE "certifications" ADD COLUMN IF NOT EXISTS "verification_date" TIMESTAMP(3);
ALTER TABLE "certifications" ADD COLUMN IF NOT EXISTS "verification_details" JSONB;
ALTER TABLE "certifications" ADD COLUMN IF NOT EXISTS "last_verified_at" TIMESTAMP(3);
ALTER TABLE "certifications" ADD COLUMN IF NOT EXISTS "email_import_id" TEXT;

-- CreateTable EmailImport
CREATE TABLE IF NOT EXISTS "email_imports" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "gmail_message_id" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "sender_name" TEXT,
    "subject" TEXT,
    "received_date" TIMESTAMP(3) NOT NULL,
    "attachment_count" INTEGER NOT NULL DEFAULT 0,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable GmailWatchState
CREATE TABLE IF NOT EXISTS "gmail_watch_states" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "history_id" TEXT,
    "expiration" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gmail_watch_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "email_imports_gmail_message_id_key" ON "email_imports"("gmail_message_id");
CREATE INDEX IF NOT EXISTS "email_imports_brand_id_idx" ON "email_imports"("brand_id");
CREATE INDEX IF NOT EXISTS "email_imports_status_idx" ON "email_imports"("status");
CREATE INDEX IF NOT EXISTS "email_imports_created_at_idx" ON "email_imports"("created_at");
CREATE INDEX IF NOT EXISTS "email_imports_gmail_message_id_idx" ON "email_imports"("gmail_message_id");

CREATE UNIQUE INDEX IF NOT EXISTS "gmail_watch_states_brand_id_key" ON "gmail_watch_states"("brand_id");

CREATE INDEX IF NOT EXISTS "certifications_verification_status_idx" ON "certifications"("verification_status");
CREATE INDEX IF NOT EXISTS "certifications_needs_review_idx" ON "certifications"("needs_review");
CREATE INDEX IF NOT EXISTS "certifications_document_hash_idx" ON "certifications"("document_hash");
CREATE INDEX IF NOT EXISTS "certifications_email_import_id_idx" ON "certifications"("email_import_id");

-- AddForeignKey
ALTER TABLE "email_imports" ADD CONSTRAINT "email_imports_brand_id_fkey" 
    FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "gmail_watch_states" ADD CONSTRAINT "gmail_watch_states_brand_id_fkey" 
    FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "certifications" ADD CONSTRAINT "certifications_email_import_id_fkey" 
    FOREIGN KEY ("email_import_id") REFERENCES "email_imports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

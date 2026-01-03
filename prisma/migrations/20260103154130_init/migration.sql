-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PREMIUM');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "SupplierType" AS ENUM ('FABRIC_MILL', 'DYE_HOUSE', 'GARMENT_FACTORY', 'TRIM_SUPPLIER', 'OTHER');

-- CreateEnum
CREATE TYPE "CertificationType" AS ENUM ('GOTS', 'OEKO_TEX', 'SA8000', 'BSCI', 'FAIR_WEAR', 'ISO14001', 'OTHER');

-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('VALID', 'EXPIRING_SOON', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('NINETY_DAY', 'THIRTY_DAY', 'SEVEN_DAY', 'EXPIRED');

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country" TEXT,
    "subscription_tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "country" TEXT NOT NULL,
    "address" TEXT,
    "supplier_type" "SupplierType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "certification_type" "CertificationType" NOT NULL,
    "certification_name" TEXT NOT NULL,
    "issuing_body" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "document_url" TEXT NOT NULL,
    "status" "CertificationStatus" NOT NULL DEFAULT 'VALID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "certification_id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "alert_type" "AlertType" NOT NULL,
    "sent_at" TIMESTAMP(3),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_clerk_user_id_key" ON "brands"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "brands_email_key" ON "brands"("email");

-- CreateIndex
CREATE INDEX "brands_clerk_user_id_idx" ON "brands"("clerk_user_id");

-- CreateIndex
CREATE INDEX "brands_email_idx" ON "brands"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_clerk_user_id_idx" ON "users"("clerk_user_id");

-- CreateIndex
CREATE INDEX "users_brand_id_idx" ON "users"("brand_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "suppliers_brand_id_idx" ON "suppliers"("brand_id");

-- CreateIndex
CREATE INDEX "suppliers_name_idx" ON "suppliers"("name");

-- CreateIndex
CREATE INDEX "suppliers_country_idx" ON "suppliers"("country");

-- CreateIndex
CREATE INDEX "suppliers_supplier_type_idx" ON "suppliers"("supplier_type");

-- CreateIndex
CREATE INDEX "certifications_supplier_id_idx" ON "certifications"("supplier_id");

-- CreateIndex
CREATE INDEX "certifications_expiry_date_idx" ON "certifications"("expiry_date");

-- CreateIndex
CREATE INDEX "certifications_status_idx" ON "certifications"("status");

-- CreateIndex
CREATE INDEX "certifications_created_at_idx" ON "certifications"("created_at");

-- CreateIndex
CREATE INDEX "certifications_certification_type_idx" ON "certifications"("certification_type");

-- CreateIndex
CREATE INDEX "alerts_brand_id_is_read_idx" ON "alerts"("brand_id", "is_read");

-- CreateIndex
CREATE INDEX "alerts_certification_id_idx" ON "alerts"("certification_id");

-- CreateIndex
CREATE INDEX "alerts_created_at_idx" ON "alerts"("created_at");

-- CreateIndex
CREATE INDEX "alerts_alert_type_idx" ON "alerts"("alert_type");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

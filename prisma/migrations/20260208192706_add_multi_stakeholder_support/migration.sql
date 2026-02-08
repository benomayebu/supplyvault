-- AlterEnum
CREATE TYPE "StakeholderRole" AS ENUM ('SUPPLIER', 'BRAND');

-- AlterTable: Brand - Add new fields
ALTER TABLE "brands" ADD COLUMN "address" TEXT;
ALTER TABLE "brands" ADD COLUMN "annual_volume" TEXT;
ALTER TABLE "brands" ADD COLUMN "required_certifications" TEXT;

-- AlterTable: Supplier - Make brand_id optional and add clerk_user_id
ALTER TABLE "suppliers" ALTER COLUMN "brand_id" DROP NOT NULL;
ALTER TABLE "suppliers" ADD COLUMN "clerk_user_id" TEXT;
ALTER TABLE "suppliers" ADD COLUMN "manufacturing_capabilities" TEXT;
ALTER TABLE "suppliers" ALTER COLUMN "supplier_type" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_clerk_user_id_key" ON "suppliers"("clerk_user_id");
CREATE INDEX "suppliers_clerk_user_id_idx" ON "suppliers"("clerk_user_id");

-- Note: This migration maintains backward compatibility
-- Existing Brand and Supplier records will continue to work
-- New suppliers can be created with clerk_user_id (independent accounts)
-- or brand_id (brand-managed accounts)

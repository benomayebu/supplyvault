-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('CONNECTED', 'DISCONNECTED');

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "description" TEXT,
ADD COLUMN     "registration_number" TEXT,
ADD COLUMN     "visible_in_search" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "supplier_connections" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'CONNECTED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "supplier_connections_brand_id_idx" ON "supplier_connections"("brand_id");

-- CreateIndex
CREATE INDEX "supplier_connections_supplier_id_idx" ON "supplier_connections"("supplier_id");

-- CreateIndex
CREATE INDEX "supplier_connections_status_idx" ON "supplier_connections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_connections_brand_id_supplier_id_key" ON "supplier_connections"("brand_id", "supplier_id");

-- AddForeignKey
ALTER TABLE "supplier_connections" ADD CONSTRAINT "supplier_connections_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_connections" ADD CONSTRAINT "supplier_connections_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

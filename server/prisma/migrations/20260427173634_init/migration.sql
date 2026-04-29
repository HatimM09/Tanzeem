-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'supervisor');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('open', 'resolved');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL,
    "otp_hash" TEXT,
    "otp_expires_at" BIGINT,
    "otp_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assigned_to" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "photo_url" TEXT,
    "barcode" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL DEFAULT 'Admin',

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_records" (
    "id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "item_id" TEXT,
    "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scanned_by" TEXT NOT NULL DEFAULT 'Supervisor',

    CONSTRAINT "scan_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "item_barcode" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "raised_by" TEXT NOT NULL DEFAULT 'Supervisor',
    "raised_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'open',
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "resolved_photo_url" TEXT,
    "resolved_note" TEXT,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "items_barcode_key" ON "items"("barcode");

-- AddForeignKey
ALTER TABLE "scan_records" ADD CONSTRAINT "scan_records_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

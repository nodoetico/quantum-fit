-- Add EXTERNAL_SYSTEM to ValidationMethod enum
ALTER TYPE "ValidationMethod" ADD VALUE IF NOT EXISTS 'EXTERNAL_SYSTEM';

-- Add dni column to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dni" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_dni_key" ON "User"("dni");
CREATE INDEX IF NOT EXISTS "User_dni_idx" ON "User"("dni");

-- Add attendanceRate, activeDays, activeDaysBitmap, isPerfectWeek to WeeklyStats
ALTER TABLE "WeeklyStats" ADD COLUMN IF NOT EXISTS "attendanceRate" DECIMAL(5,2) NOT NULL DEFAULT 0;
ALTER TABLE "WeeklyStats" ADD COLUMN IF NOT EXISTS "activeDays" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "WeeklyStats" ADD COLUMN IF NOT EXISTS "activeDaysBitmap" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "WeeklyStats" ADD COLUMN IF NOT EXISTS "isPerfectWeek" BOOLEAN NOT NULL DEFAULT false;

-- Create Landing Content tables
CREATE TABLE IF NOT EXISTS "LandingContent" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "ctaText" TEXT,
    "ctaLink" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LandingContent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "LandingContent_section_idx" ON "LandingContent"("section");
CREATE INDEX IF NOT EXISTS "LandingContent_isActive_idx" ON "LandingContent"("isActive");

CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "text" TEXT NOT NULL,
    "photoUrl" TEXT,
    "rating" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Testimonial_isActive_idx" ON "Testimonial"("isActive");

CREATE TABLE IF NOT EXISTS "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "period" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "features" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Plan_isActive_idx" ON "Plan"("isActive");

CREATE TABLE IF NOT EXISTS "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "linkText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Banner_isActive_idx" ON "Banner"("isActive");

CREATE TABLE IF NOT EXISTS "GalleryImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "GalleryImage_category_idx" ON "GalleryImage"("category");
CREATE INDEX IF NOT EXISTS "GalleryImage_isActive_idx" ON "GalleryImage"("isActive");

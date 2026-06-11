-- Create Course table for landing page courses/disciplines
CREATE TABLE IF NOT EXISTS "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Course_isActive_idx" ON "Course"("isActive");

-- Create BuffetItem table for buffet menu
CREATE TABLE IF NOT EXISTS "BuffetItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2),
    "category" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BuffetItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "BuffetItem_isActive_idx" ON "BuffetItem"("isActive");
CREATE INDEX IF NOT EXISTS "BuffetItem_category_idx" ON "BuffetItem"("category");

-- Create News table for blog/news
CREATE TABLE IF NOT EXISTS "News" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT,
    "imageUrl" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "News_isActive_idx" ON "News"("isActive");
CREATE INDEX IF NOT EXISTS "News_publishedAt_idx" ON "News"("publishedAt");

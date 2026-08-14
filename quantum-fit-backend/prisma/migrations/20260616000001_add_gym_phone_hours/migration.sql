-- Add missing columns to Gym model (added to schema.prisma but never migrated)
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Gym" ADD COLUMN IF NOT EXISTS "hours" TEXT;

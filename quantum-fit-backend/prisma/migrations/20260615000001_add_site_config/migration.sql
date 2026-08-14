-- Create SiteConfig table for general site configuration
CREATE TABLE IF NOT EXISTS "SiteConfig" (
    "id" TEXT NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'Quantum Fit',
    "slogan" TEXT NOT NULL DEFAULT 'Transforma tu cuerpo. Potencia tu mente.',
    "description" TEXT NOT NULL DEFAULT 'Entrenamiento de última generación para personas que buscan resultados reales.',
    "email" TEXT NOT NULL DEFAULT 'info@quantumfit.com',
    "phone" TEXT NOT NULL DEFAULT '+54 11 1234-5678',
    "whatsapp" TEXT NOT NULL DEFAULT '541112345678',
    "instagramUrl" TEXT,
    "youtubeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);

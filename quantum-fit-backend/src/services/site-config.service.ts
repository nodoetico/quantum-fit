import { prisma } from '../database';

export async function getOrCreateConfig() {
  let config = await prisma.siteConfig.findFirst();
  if (!config) {
    config = await prisma.siteConfig.create({ data: {} });
  }
  return config;
}

export async function updateConfig(data: {
  siteName?: string;
  slogan?: string;
  description?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}) {
  const existing = await getOrCreateConfig();
  return prisma.siteConfig.update({
    where: { id: existing.id },
    data,
  });
}

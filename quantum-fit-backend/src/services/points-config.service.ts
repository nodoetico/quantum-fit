import { prisma } from '../database';

export async function getAllConfigs() {
  return prisma.pointsConfig.findMany({
    orderBy: [{ category: 'asc' }, { activityKey: 'asc' }],
  });
}

export async function getConfigByKey(key: string) {
  return prisma.pointsConfig.findUnique({ where: { activityKey: key } });
}

export async function upsertConfig(data: {
  activityKey: string;
  label: string;
  points: number;
  category: string;
  isActive?: boolean;
}) {
  return prisma.pointsConfig.upsert({
    where: { activityKey: data.activityKey },
    update: { label: data.label, points: data.points, category: data.category, isActive: data.isActive ?? true },
    create: data,
  });
}

export async function deleteConfig(id: string) {
  return prisma.pointsConfig.delete({ where: { id } });
}

export async function getPointsForActivity(activityKey: string): Promise<number> {
  const config = await prisma.pointsConfig.findUnique({ where: { activityKey } });
  return config?.points ?? 0;
}

export async function seedDefaultConfigs() {
  const count = await prisma.pointsConfig.count();
  if (count > 0) return;

  const defaults = [
    { activityKey: 'CHECK_IN_CLASS', label: 'Check-in en Clase', points: 75, category: 'checkin' },
    { activityKey: 'CHECK_IN_OPEN_GYM', label: 'Check-in en Open Gym', points: 50, category: 'checkin' },
    { activityKey: 'CHECK_IN_PT', label: 'Check-in Entrenamiento Personal', points: 100, category: 'checkin' },
    { activityKey: 'STREAK_BONUS_7_DAYS', label: 'Racha de 7 días', points: 100, category: 'streak' },
    { activityKey: 'STREAK_BONUS_30_DAYS', label: 'Racha de 30 días', points: 500, category: 'streak' },
    { activityKey: 'PERFECT_WEEK_BONUS', label: 'Semana Perfecta', points: 200, category: 'streak' },
    { activityKey: 'REFERRAL_BONUS', label: 'Referido', points: 150, category: 'referral' },
  ];

  for (const config of defaults) {
    await prisma.pointsConfig.create({ data: config });
  }
}

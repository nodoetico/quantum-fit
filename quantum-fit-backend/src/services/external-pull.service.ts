import { getCrystalClient, getCrystalToken } from './crystal-auth.service';
import { prisma } from '../database';
import { notifyUser } from './notification.service';
import { recalculateUserLevel } from './level.service';
import { getPointsForActivity } from './points-config.service';

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_URL || 'https://crystal.getmifit.app';

interface ExternalUser {
  id: number;
  name: string;
  email: string;
  dni: string;
  balance: number;
  qr_code: string;
  phone: string | null;
  gender: string | null;
  blood_type: string | null;
  emergency_contact: {
    name: string;
    phone: string;
    email?: string;
    relationship?: string;
    address?: string;
  } | null;
}

interface ExternalMembership {
  id: number;
  plan?: { name: string };
  name?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  auto_renew?: boolean;
}

interface ExternalAttendance {
  id: number;
  date?: string;
  time?: string;
  type?: string;
  location?: string;
}

interface ExternalTransaction {
  id: number;
  date?: string;
  amount?: number;
  type?: string;
  description?: string;
}

interface CrystalCache {
  profile?: ExternalUser | null;
  memberships?: ExternalMembership[];
  fetchedAt: string;
}

function mapLocalUserToExternal(user: { name: string; email: string; dni?: string | null; id: string }): ExternalUser {
  return {
    id: 0,
    name: user.name,
    email: user.email,
    dni: user.dni || '',
    balance: 0,
    qr_code: '',
    phone: null,
    gender: null,
    blood_type: null,
    emergency_contact: null,
  };
}

async function tryCrystalByDni<T>(dni: string, path: string): Promise<T | null> {
  try {
    const client = await getCrystalClient();
    const response = await client.get<{ data: T }>(`/users/by-dni/${dni}${path}`);
    if (response.data?.data) return response.data.data;
    return null;
  } catch {
    return null;
  }
}

async function updateCrystalCache(dni: string, updates: Partial<CrystalCache>): Promise<void> {
  try {
    const user = await prisma.user.findFirst({ where: { dni } });
    if (!user) return;

    const existing = user.crystalData as unknown as CrystalCache | null;
    const merged: CrystalCache = {
      ...(existing || { fetchedAt: new Date().toISOString() }),
      ...updates,
      fetchedAt: new Date().toISOString(),
    };
    await prisma.user.update({
      where: { id: user.id },
      data: { crystalData: merged as object },
    });
  } catch {
  }
}

async function getCachedData(dni: string): Promise<CrystalCache | null> {
  try {
    const user = await prisma.user.findFirst({ where: { dni } });
    if (!user?.crystalData) return null;
    return user.crystalData as unknown as CrystalCache;
  } catch {
    return null;
  }
}

export async function pullUserProfile(dni?: string): Promise<ExternalUser | null> {
  if (!dni) return null;

  const cached = await getCachedData(dni);
  if (cached?.profile) return cached.profile;

  const crystalProfile = await tryCrystalByDni<ExternalUser>(dni, '/profile');
  if (crystalProfile) {
    await updateCrystalCache(dni, { profile: crystalProfile });
    return crystalProfile;
  }

  const crystalProfileAlt = await tryCrystalByDni<ExternalUser>(dni, '');
  if (crystalProfileAlt) {
    await updateCrystalCache(dni, { profile: crystalProfileAlt });
    return crystalProfileAlt;
  }

  const user = await prisma.user.findFirst({ where: { dni } });
  if (user) {
    const localProfile = mapLocalUserToExternal(user);
    await updateCrystalCache(dni, { profile: localProfile });
    return localProfile;
  }

  return null;
}

export async function pullUserMemberships(dni?: string): Promise<ExternalMembership[]> {
  if (!dni) return [];

  const cached = await getCachedData(dni);
  if (cached?.memberships) return cached.memberships;

  const crystalMemberships = await tryCrystalByDni<ExternalMembership[]>(dni, '/memberships');
  if (crystalMemberships) {
    await updateCrystalCache(dni, { memberships: crystalMemberships });
    return crystalMemberships;
  }

  const user = await prisma.user.findFirst({
    where: { dni },
    include: { subscription: true },
  });

  if (user?.subscription) {
    const local: ExternalMembership = {
      id: 0,
      name: user.subscription.subscriptionType,
      status: user.subscription.status,
      start_date: user.subscription.startDate.toISOString(),
      end_date: user.subscription.endDate?.toISOString(),
      auto_renew: false,
    };
    await updateCrystalCache(dni, { memberships: [local] });
    return [local];
  }

  return [];
}

export async function pullUserAttendances(startDate?: string, endDate?: string, dni?: string): Promise<ExternalAttendance[]> {
  if (!dni) return [];

  const crystalAttendances = await tryCrystalByDni<ExternalAttendance[]>(dni, '/attendances');
  if (crystalAttendances) {
    return crystalAttendances;
  }

  const user = await prisma.user.findFirst({ where: { dni } });
  if (!user) return [];

  const whereFilter: Record<string, unknown> = { userId: user.id };
  if (startDate || endDate) {
    whereFilter.checkInTime = {};
    if (startDate) (whereFilter.checkInTime as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (whereFilter.checkInTime as Record<string, unknown>).lte = new Date(endDate);
  }

  const checkIns = await prisma.checkIn.findMany({
    where: whereFilter,
    orderBy: { checkInTime: 'desc' },
    take: 100,
  });

  return checkIns.map(c => ({
    id: 0,
    date: c.checkInTime.toISOString(),
    time: c.checkInTime.toISOString(),
    type: c.checkInType,
    location: c.gymLocation || undefined,
  }));
}

export async function pullUserTransactions(startDate?: string, endDate?: string, dni?: string): Promise<ExternalTransaction[]> {
  if (!dni) return [];

  const crystalTransactions = await tryCrystalByDni<ExternalTransaction[]>(dni, '/transactions');
  if (crystalTransactions) {
    return crystalTransactions;
  }

  const user = await prisma.user.findFirst({ where: { dni } });
  if (!user) return [];

  const whereFilter: Record<string, unknown> = { userId: user.id };
  if (startDate || endDate) {
    whereFilter.paidAt = {};
    if (startDate) (whereFilter.paidAt as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (whereFilter.paidAt as Record<string, unknown>).lte = new Date(endDate);
  }

  const payments = await prisma.payment.findMany({
    where: whereFilter,
    orderBy: { paidAt: 'desc' },
    take: 50,
  });

  return payments.map(p => ({
    id: 0,
    date: p.paidAt?.toISOString() || p.createdAt.toISOString(),
    amount: Number(p.amount),
    type: p.paymentType,
    description: p.description || undefined,
  }));
}

export async function syncMembershipsFromExternal(user: { id: string; dni?: string | null }, dni?: string): Promise<{
  synced: number;
  memberships: ExternalMembership[];
}> {
  const userDni = dni || user.dni;
  if (!userDni) {
    return { synced: 0, memberships: [] };
  }

  const externalMemberships = await pullUserMemberships(userDni);

  for (const extMembership of externalMemberships) {
    try {
      const existing = await prisma.subscription.findFirst({
        where: { userId: user.id },
      });

      if (existing) {
        await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            status: extMembership.status === 'active' ? 'ACTIVE' :
                    extMembership.status === 'expired' ? 'EXPIRED' : 'CANCELLED',
            endDate: extMembership.end_date ? new Date(extMembership.end_date) : undefined,
          },
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            subscriptionType: 'VIP_MONTHLY',
            status: extMembership.status === 'active' ? 'ACTIVE' :
                    extMembership.status === 'expired' ? 'EXPIRED' : 'CANCELLED',
            startDate: extMembership.start_date ? new Date(extMembership.start_date) : new Date(),
            endDate: extMembership.end_date ? new Date(extMembership.end_date) : new Date(),
            price: 0,
            currency: 'ARS',
            billingCycle: 'MONTHLY',
          },
        });
      }
    } catch (syncErr: unknown) {
      console.error('[ExternalPull] Error al sincronizar membresía:', syncErr instanceof Error ? syncErr.message : 'Error');
    }
  }

  return {
    synced: externalMemberships.length,
    memberships: externalMemberships,
  };
}

export async function syncAttendancesFromExternal(user: { id: string; dni?: string | null; points: number; totalPointsEarned: number }, startDate?: string, endDate?: string, dni?: string): Promise<{
  synced: number;
  created: number;
  attendances: ExternalAttendance[];
}> {
  const userDni = dni || user.dni;
  if (!userDni) {
    return { synced: 0, created: 0, attendances: [] };
  }

  const externalAttendances = await pullUserAttendances(startDate, endDate, userDni);
  let created = 0;

  for (const attendance of externalAttendances) {
    try {
      const attendanceDate = attendance.date ? new Date(attendance.date) : new Date();

      const existingCheckIn = await prisma.checkIn.findFirst({
        where: {
          userId: user.id,
          checkInTime: attendanceDate,
        },
      });

      if (!existingCheckIn && attendance.type !== 'exit') {
        const pointsToAdd = await getPointsForActivity('CHECK_IN_OPEN_GYM').catch(() => 50);

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            points: { increment: pointsToAdd },
            totalPointsEarned: { increment: pointsToAdd },
            lastActive: new Date(),
          },
        });

        await prisma.checkIn.create({
          data: {
            userId: user.id,
            checkInType: 'OPEN_GYM',
            pointsEarned: pointsToAdd,
            validationMethod: 'EXTERNAL_SYSTEM',
            checkInTime: attendanceDate,
            gymLocation: attendance.location || 'Sede Externa',
          },
        });

        await recalculateUserLevel(user.id);

        notifyUser(user.id, 'points-updated', {
          userId: user.id,
          newBalance: updatedUser.points,
          earned: pointsToAdd,
        });

        created++;
      }
    } catch (syncErr: unknown) {
      console.error('[ExternalPull] Error al sincronizar asistencia:', syncErr instanceof Error ? syncErr.message : 'Error');
    }
  }

  return {
    synced: externalAttendances.length,
    created,
    attendances: externalAttendances,
  };
}

export async function testExternalConnection(): Promise<{
  success: boolean;
  message: string;
  apiUrl: string;
}> {
  try {
    const token = await getCrystalToken();

    if (!token) {
      return {
        success: false,
        message: 'No se pudo obtener el Bearer token',
        apiUrl: EXTERNAL_API_BASE_URL,
      };
    }

    const client = await getCrystalClient();
    await client.get('/user/me');

    return {
      success: true,
      message: 'Conexión exitosa con el sistema externo',
      apiUrl: EXTERNAL_API_BASE_URL,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: `Error de conexión: ${error instanceof Error ? error.message : 'Error'}`,
      apiUrl: EXTERNAL_API_BASE_URL,
    };
  }
}

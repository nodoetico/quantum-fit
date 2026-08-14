// Servicio de Sincronización Programada
// Sincroniza datos de todos los usuarios desde Crystal/MiFit
import { prisma } from '../database';
import {
  pullUserProfile,
  pullUserMemberships,
  syncAttendancesFromExternal,
} from './external-pull.service';

interface SyncResult {
  total: number;
  processed: number;
  errors: number;
  skipped: number;
  details: Array<{
    dni: string;
    name: string;
    profile: boolean;
    memberships: boolean;
    attendances: boolean;
    error?: string;
  }>;
}

export async function syncAllUsers(): Promise<SyncResult> {
  const result: SyncResult = {
    total: 0,
    processed: 0,
    errors: 0,
    skipped: 0,
    details: [],
  };

  const users = await prisma.user.findMany({
    where: {
      dni: { not: null },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      dni: true,
      points: true,
      totalPointsEarned: true,
    },
  });

  result.total = users.length;
  console.log(`[SyncScheduler] Iniciando sincronización de ${users.length} usuarios...`);

  for (const user of users) {
    const dni = user.dni!;
    const entry: SyncResult['details'][0] = {
      dni,
      name: user.name,
      profile: false,
      memberships: false,
      attendances: false,
    };

    try {
      const [profile, memberships] = await Promise.all([
        pullUserProfile(dni).catch(() => null),
        pullUserMemberships(dni).catch(() => null),
      ]);

      entry.profile = !!profile;
      entry.memberships = memberships ? memberships.length > 0 : false;

      // Sincronizar asistencias de los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const attendances = await syncAttendancesFromExternal(
        user,
        thirtyDaysAgo.toISOString(),
        new Date().toISOString(),
        dni,
      ).catch(() => ({ synced: 0, created: 0, attendances: [] }));

      entry.attendances = attendances.synced > 0;
      result.processed++;

      console.log(
        `[SyncScheduler] OK ${dni} ${user.name} | ` +
        `perfil:${entry.profile} membresías:${entry.memberships} asistencias:${attendances.synced}`
      );
    } catch (err) {
      entry.error = err instanceof Error ? err.message : 'Error desconocido';
      result.errors++;
      console.error(`[SyncScheduler] ERROR ${dni} ${user.name}: ${entry.error}`);
    }

    result.details.push(entry);
  }

  console.log(
    `[SyncScheduler] Completado: ${result.processed} procesados, ` +
    `${result.errors} errores, ${result.skipped} omitidos de ${result.total} totales`
  );

  return result;
}

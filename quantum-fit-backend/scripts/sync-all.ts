// Script de sincronización masiva con Crystal/MiFit
// Uso: npx tsx scripts/sync-all.ts
// También se puede ejecutar como cron job: 0 3 * * * cd /ruta/proyecto && npx tsx scripts/sync-all.ts
import { PrismaClient } from '@prisma/client';
import {
  pullUserProfile,
  pullUserMemberships,
  syncAttendancesFromExternal,
} from '../src/services/external-pull.service';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Sincronización Masiva Crystal/MiFit ===');
  console.log(`Inicio: ${new Date().toISOString()}\n`);

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

  console.log(`Usuarios con DNI: ${users.length}\n`);

  let processed = 0;
  let errors = 0;

  for (const user of users) {
    const dni = user.dni!;
    try {
      const [profile] = await Promise.all([
        pullUserProfile(dni),
        pullUserMemberships(dni),
      ]);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const attendances = await syncAttendancesFromExternal(
        user,
        thirtyDaysAgo.toISOString(),
        new Date().toISOString(),
        dni,
      );

      processed++;
      console.log(
        `[OK] ${dni} ${user.name} | ` +
        `perfil:${profile ? '✓' : '✗'} ` +
        `asistencias sincronizadas:${attendances.created}`
      );
    } catch (err) {
      errors++;
      console.error(`[ERR] ${dni} ${user.name}: ${err instanceof Error ? err.message : 'Error'}`);
    }
  }

  console.log(`\n=== Resumen ===`);
  console.log(`Procesados: ${processed}`);
  console.log(`Errores: ${errors}`);
  console.log(`Fin: ${new Date().toISOString()}`);

  if (errors > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
}).finally(() => prisma.$disconnect());

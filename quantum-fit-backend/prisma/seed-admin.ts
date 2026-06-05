// Script para crear el primer usuario administrador
// Uso: npx tsx prisma/seed-admin.ts

import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creando usuario administrador...\n');

  // Datos del admin
  const adminEmail = 'admin@quantumfit.com';
  const adminPassword = 'Admin123!';
  const adminName = 'Administrador Quantum Fit';

  // Verificar si ya existe un admin
  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN },
  });

  if (existingAdmin) {
    console.log('✅ Ya existe un usuario administrador:');
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   Nombre: ${existingAdmin.name}`);
    console.log('\n💡 Si necesitas crear otro, ejecutá este script manualmente.');
    return;
  }

  // Hashear contraseña
  const passwordHash = await hash(adminPassword, 10);

  // Crear administrador
  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: UserRole.ADMIN,
      points: 1000, // Puntos extra por ser admin
      totalPointsEarned: 1000,
    },
  });

  console.log('✅ ¡Administrador creado exitosamente!\n');
  console.log('📋 DATOS DE ACCESO:');
  console.log('   Email:', adminEmail);
  console.log('   Contraseña:', adminPassword);
  console.log('\n⚠️  IMPORTANTE: Cambiá la contraseña después del primer login!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

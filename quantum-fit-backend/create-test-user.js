// Script para crear usuario de prueba
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  const email = 'test@quantumfit.com';
  const password = 'test123';
  const name = 'Usuario Test';

  try {
    // Verificar si ya existe
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('✅ El usuario de prueba YA existe:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      return;
    }

    // Generar hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'USER',
        level: 5,
        points: 1500,
        totalPointsEarned: 2000,
        isActive: true
      }
    });

    console.log('✅ Usuario de prueba CREADO exitosamente:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   ID: ${user.id}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

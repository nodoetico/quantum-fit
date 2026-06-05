// Configuración de la base de datos con Prisma
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Función para conectar a la base de datos
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
  } catch (error) {
    process.exit(1);
  }
}

// Función para desconectar
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

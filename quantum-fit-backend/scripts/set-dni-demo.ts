import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'demo@quantumfit.com' } });
  if (user) {
    console.log('Found:', user.id, user.name, 'DNI:', user.dni);
    if (!user.dni) {
      await prisma.user.update({ where: { id: user.id }, data: { dni: '47931799' } });
      console.log('DNI updated to 47931799');
    } else {
      console.log('DNI already set');
    }
  } else {
    console.log('User not found');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    const userCount = await prisma.user.count();
    console.log(`✅ User count: ${userCount}`);
  } catch (e) {
    console.error('❌ Database connection failed');
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

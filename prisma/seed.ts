import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: 'admin@rentnest.com' },
  });

  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@rentnest.com',
        password: hashed,
        role: Role.ADMIN,
      },
    });
    console.log('Admin user created: admin@rentnest.com / admin123');
  } else {
    console.log('Admin already exists, skipping seed.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

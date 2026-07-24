import 'dotenv/config';
import { PrismaNeonHttp } from '@prisma/adapter-neon';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
const prisma = new PrismaClient({ adapter });

const DEFAULT_CATEGORIES = ['Apartment', 'House', 'Studio', 'Villa', 'Duplex', 'Room', 'Office Space'];

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@rentnest.com' } });
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: { name: 'Admin', email: 'admin@rentnest.com', password: hashed, role: Role.ADMIN },
    });
    console.log('Admin user created: admin@rentnest.com / admin123');
  } else {
    console.log('Admin already exists, skipping.');
  }

  for (const name of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

import { prisma } from '../src/prisma';

async function main() {
  const branches = [
    {
      code: 'HQ',
      name: 'Head Office',
      address: '123 Main St, Metro City',
      isActive: true
    },
    {
      code: 'BR1',
      name: 'Branch One',
      address: '456 Market Ave, Uptown',
      isActive: true
    },
    {
      code: 'BR2',
      name: 'Branch Two',
      address: '789 Industrial Rd, Riverside',
      isActive: true
    }
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { code: branch.code },
      update: { name: branch.name, address: branch.address, isActive: branch.isActive },
      create: branch
    });
  }
}

(async () => {
  try {
    await main();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Failed to seed database', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); // NOSONAR

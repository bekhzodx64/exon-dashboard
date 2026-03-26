const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Start Seeding ---');

  // 1. Создаем глобального админа
  const hashedPassword = await bcrypt.hash('adminpassword', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@exon.com' },
    update: {},
    create: {
      email: 'admin@exon.com',
      name: 'Global Admin',
      password: hashedPassword,
      role: 'global_admin',
      brandColor: '234 88 12',
    },
  });
  console.log('✔ Global Admin created');

  // 2. Создаем категории знаний
  const categories = [
    { name: 'Marketplace', icon: 'Package' },
    { name: 'SEO Optimization', icon: 'TrendingUp' },
    { name: 'Shipping & Delivery', icon: 'Truck' },
  ];

  for (const cat of categories) {
    const category = await prisma.knowledgeCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        icon: cat.icon,
      },
    });

    // 3. Создаем модули в каждой категории
    const module = await prisma.knowledgeModule.create({
      data: {
        categoryId: category.id,
        title: `Guide to ${cat.name}`,
        description: `Essential introduction to ${cat.name.toLowerCase()}`,
      },
    });

    // 4. Создаем статьи (items) в каждом модуле
    await prisma.knowledgeItem.create({
      data: {
        moduleId: module.id,
        title: 'Introduction and Basics',
        content: `<h1>Welcome to ${cat.name} guide</h1><p>This is a seeded content explaining how to work with ${cat.name.toLowerCase()}.</p>`,
        order: 0,
      },
    });
  }

  console.log('✔ Knowledge Base seeded with categories and articles');
  console.log('--- Seeding Done ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

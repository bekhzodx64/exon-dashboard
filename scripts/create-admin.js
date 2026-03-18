const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@exon.com";
  const password = "adminpassword"; // Вы можете изменить пароль здесь
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "global_admin",
    },
    create: {
      email,
      name: "Global Admin",
      password: hashedPassword,
      role: "global_admin",
    },
  });

  console.log("-----------------------------------------");
  console.log("Администратор успешно создан/обновлен!");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`Role: ${user.role}`);
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

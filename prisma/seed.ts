import { PrismaClient } from "@prisma/client";

import { seedUser } from "./fixtures";

const seed = async () => {
  console.info("Seeding database...");
  const prisma = new PrismaClient();
  await seedUser(prisma);
  await prisma.$disconnect();
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

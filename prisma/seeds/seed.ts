import { PrismaClient } from "@prisma/client";

import { seedUser } from "./fixtures/User";

const seed = async () => {
  const prisma = new PrismaClient();

  console.info("Seeding database...");
  await seedUser(prisma);

  prisma.$disconnect();
};

seed();

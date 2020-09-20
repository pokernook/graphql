import { PrismaClient } from "nexus-plugin-prisma/client";
import { seedUser } from "./models/user";

const seed = async () => {
  const prisma = new PrismaClient();

  console.info("Seeding database...");
  await seedUser(prisma);

  prisma.$disconnect();
};

seed();

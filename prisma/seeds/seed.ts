import { PrismaClient } from "nexus-plugin-prisma/client";
import { seedUser } from "./models/user";

const seed = async () => {
  const prisma = new PrismaClient();

  await seedUser(prisma);

  prisma.$disconnect();
};

seed();

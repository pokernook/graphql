import { PrismaClient } from "../../../../generated/prisma/client";
import { users } from "./data";

export const seedUser = async (prisma: PrismaClient): Promise<void> => {
  try {
    await Promise.all(users.map((user) => prisma.user.create({ data: user }))); // TODO: Upsert to avoid uniqueness failures?
    console.info(`✅ User (${users.length})`);
  } catch (e) {
    console.error(e);
  }
};

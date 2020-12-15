import { PrismaClient } from "@prisma/client";

import { users } from "./data";

export const seedUser = async (prisma: PrismaClient): Promise<void> => {
  try {
    await Promise.all(
      users.map((user) =>
        prisma.user.upsert({
          create: user,
          update: user,
          where: { email: user.email },
        })
      )
    );
    console.info(`✅ User (${users.length})`);
  } catch (e) {
    console.error(e);
  }
};

import { Prisma, PrismaClient } from "@prisma/client";

const passwordHash = // Translates to 'password'
  "$argon2id$v=19$m=4096,t=3,p=1$awIn+BOIcEF8KhDWVuUBPQ$f6VLaW4X0AmAnBMvdsnFssUjERdPAbpUC4UmrU2AoSk";

const users: Prisma.UserCreateInput[] = [
  {
    email: "dog@a.a",
    username: "dog",
    discriminator: 1234,
    passwordHash,
    status: { create: { emoji: "🐶", message: "Big Dog Run energy" } },
  },
  {
    email: "cow@a.a",
    username: "cow",
    discriminator: 5678,
    passwordHash,
    status: { create: { emoji: "🐮", message: "Cows go moo" } },
  },
  {
    email: "fox@a.a",
    username: "fox",
    discriminator: 12,
    passwordHash,
    status: { create: { emoji: "🦊", message: "Can't keep a good fox down" } },
  },
];

export const seedUser = async (prisma: PrismaClient): Promise<void> => {
  try {
    await Promise.all(
      users.map((user) =>
        prisma.user.upsert({
          create: user,
          update: {},
          where: { email: user.email },
        })
      )
    );
    console.info(`✅ User (${users.length})`);
  } catch (e) {
    console.error(e);
  }
};

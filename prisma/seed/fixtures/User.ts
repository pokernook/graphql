import { Prisma, PrismaClient } from "@prisma/client";

const passwordHash = // Translates to 'password'
  "$argon2id$v=19$m=4096,t=3,p=1$awIn+BOIcEF8KhDWVuUBPQ$f6VLaW4X0AmAnBMvdsnFssUjERdPAbpUC4UmrU2AoSk";

export const users: Prisma.UserCreateInput[] = [
  {
    id: "1",
    email: "test@email.com",
    username: "test",
    discriminator: 1234,
    passwordHash,
  },
  {
    id: "2",
    email: "cowbell@email.com",
    username: "cowbell",
    discriminator: 5678,
    passwordHash,
  },
];

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

import { PrismaClient, UserCreateInput } from "nexus-plugin-prisma/client";

// TODO: Users should somehow be seeded with a password hash that allows for test logins
const users: UserCreateInput[] = [
  { id: "1", email: "test@email.com" },
  { id: "2", email: "cowbell@email.com" },
];

export const seedUser = async (prisma: PrismaClient): Promise<void> => {
  try {
    await Promise.all(users.map((user) => prisma.user.create({ data: user })));
    console.info(`✅ User (${users.length})`);
  } catch (e) {
    console.error(e.message);
  }
};

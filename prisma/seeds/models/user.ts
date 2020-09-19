import { PrismaClient, UserCreateInput } from "nexus-plugin-prisma/client";

const users: UserCreateInput[] = [
  { email: "test@email.com" },
  { email: "cowbell@email.com" },
];

export const seedUser = async (prisma: PrismaClient): Promise<void> => {
  try {
    await Promise.all(users.map((user) => prisma.user.create({ data: user })));
  } catch (e) {
    console.error(e);
  }
};

import { PrismaClient, UserCreateInput } from "nexus-plugin-prisma/client";

const users: UserCreateInput[] = [
  { id: "1", email: "test@email.com" },
  { id: "2", email: "cowbell@email.com" },
];

// TODO: Seeding should be skip over duplicate records, instead of reporting an error
export const seedUser = async (prisma: PrismaClient): Promise<void> => {
  try {
    await Promise.all(users.map((user) => prisma.user.create({ data: user })));
  } catch (e) {
    console.error(e);
  }
};

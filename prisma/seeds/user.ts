import {
  PrismaClient,
  User,
  UserCreateInput,
} from "nexus-plugin-prisma/client";

const users: UserCreateInput[] = [
  { email: "test@email.com" },
  { email: "cowbell@email.com" },
];

export const seedUser = async (): Promise<User[] | undefined> => {
  const prisma = new PrismaClient();
  try {
    return Promise.all(users.map((user) => prisma.user.create({ data: user })));
  } catch (e) {
    console.error(e);
  } finally {
    prisma.$disconnect();
  }
};

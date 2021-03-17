import { Prisma, PrismaClient } from "@prisma/client";

const friendships: Prisma.FriendshipCreateInput[] = [
  {
    id: "1",
    users: {
      connect: [{ email: "dog@a.a" }, { email: "cow@a.a" }],
    },
  },
];

export const seedFriendship = async (prisma: PrismaClient): Promise<void> => {
  try {
    await Promise.all(
      friendships.map((friendship) =>
        prisma.friendship.upsert({
          create: friendship,
          update: {},
          where: { id: friendship.id },
        })
      )
    );
    console.info(`✅ Friendship (${friendships.length})`);
  } catch (e) {
    console.error(e);
  }
};

import { arg, mutationField, objectType, stringArg } from "nexus";

import { isAuthenticated } from "../rules";

export const UserStatusObject = objectType({
  name: "UserStatus",
  definition(t) {
    t.model.createdAt();
    t.model.emoji();
    t.model.id();
    t.model.message();
    t.model.updatedAt();
    t.model.user();
  },
});

export const userStatusSet = mutationField("userStatusSet", {
  type: "UserStatus",
  shield: isAuthenticated(),
  args: {
    emoji: arg({ type: "EmojiSingular" }),
    message: stringArg(),
  },
  validate: ({ string }) => ({
    message: string().max(80),
  }),
  resolve: async (_root, { emoji, message }, { prisma, user }) => {
    const { status } = await prisma.user.update({
      where: { id: user?.id },
      select: { status: true },
      data: {
        status: {
          upsert: {
            create: { emoji, message },
            update: { emoji, message },
          },
        },
      },
    });
    return status;
  },
});

export const userStatusClear = mutationField("userStatusClear", {
  type: "UserStatus",
  shield: isAuthenticated(),
  resolve: async (_root, _args, { prisma, user }) => {
    const userWithStatus = await prisma.user.findUnique({
      where: { id: user?.id },
      include: { status: true },
      rejectOnNotFound: true,
    });
    if (!userWithStatus.status) {
      return null;
    }
    return await prisma.userStatus.delete({
      where: { id: userWithStatus.status.id },
    });
  },
});

import { arg, extendType, objectType, stringArg } from "nexus";

import { isAuthenticated } from "../rules";
import { EmojiSingular } from "./Scalars";

export const UserStatus = objectType({
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

export const UserStatusMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("userStatusSet", {
      type: UserStatus,
      shield: isAuthenticated(),
      args: {
        emoji: arg({ type: EmojiSingular }),
        message: stringArg(),
      },
      validate: ({ string }) => ({
        message: string().max(80),
      }),
      resolve: async (_root, { emoji, message }, ctx) => {
        const { status } = await ctx.prisma.user.update({
          where: { id: ctx.user?.id },
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

    t.field("userStatusClear", {
      type: UserStatus,
      shield: isAuthenticated(),
      resolve: async (_root, _args, ctx) => {
        const userWithStatus = await ctx.prisma.user.findUnique({
          where: { id: ctx.user?.id },
          include: { status: true },
        });
        if (!userWithStatus?.status) {
          return null;
        }
        return await ctx.prisma.userStatus.delete({
          where: { id: userWithStatus.status.id },
        });
      },
    });
  },
});

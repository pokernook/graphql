import { extendType, nonNull, objectType, stringArg } from "nexus";

import { isAuthenticated } from "../rules";

export const UserStatus = objectType({
  name: "UserStatus",
  definition(t) {
    t.model.createdAt();
    t.model.id();
    t.model.message();
    t.model.updatedAt();
    t.model.user();
  },
});

export const UserStatusMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("userSetStatus", {
      type: UserStatus,
      shield: isAuthenticated(),
      args: {
        message: nonNull(stringArg()),
      },
      resolve: async (_root, { message }, ctx) => {
        const { status } = await ctx.prisma.user.update({
          where: { id: ctx.user?.id },
          select: { status: true },
          data: {
            status: {
              upsert: {
                create: { message },
                update: { message },
              },
            },
          },
        });
        return status;
      },
    });
  },
});

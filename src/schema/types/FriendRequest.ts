import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";

import { isAuthenticated } from "../rules";

export const FriendRequest = objectType({
  name: "FriendRequest",
  definition(t) {
    t.model.createdAt();
    t.model.from();
    t.model.id();
    t.model.to();
  },
});

export const FriendMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("friendRequestSend", {
      type: FriendRequest,
      shield: isAuthenticated(),
      args: {
        username: nonNull(stringArg()),
        discriminator: nonNull(intArg()),
      },
      resolve: async (_root, { username, discriminator }, ctx) => {
        if (!ctx.user) {
          return null;
        }
        const to = await ctx.prisma.user.findUnique({
          where: { Tag: { username, discriminator } },
        });
        if (!to) {
          throw new Error("User not found");
        } else if (ctx.user.id === to.id) {
          throw new Error("You can't friend yourself");
        }
        const friendRequest = await ctx.prisma.friendRequest.create({
          data: {
            from: {
              connect: { id: ctx.user.id },
            },
            to: {
              connect: { id: to.id },
            },
          },
        });
        return friendRequest;
      },
    });
  },
});

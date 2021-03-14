import { extendType, intArg, nonNull, objectType, stringArg } from "nexus";

import { isAuthenticated } from "../rules";

export const FriendRequest = objectType({
  name: "FriendRequest",
  definition(t) {
    t.model.createdAt();
    t.model.from();
    t.model.id();
    t.model.status();
    t.model.to();
    t.model.updatedAt();
  },
});

export const FriendRequestMutation = extendType({
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
          rejectOnNotFound: true,
        });
        if (ctx.user.id === to.id) {
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

    t.field("friendRequestAccept", {
      type: FriendRequest,
      shield: isAuthenticated(),
      args: { friendRequestId: nonNull(stringArg()) },
      resolve: async (_root, { friendRequestId }, ctx) => {
        if (!ctx.user) {
          return null;
        }
        const friendRequest = await ctx.prisma.friendRequest.findUnique({
          where: { id: friendRequestId },
          rejectOnNotFound: true,
        });
        if (friendRequest.toId !== ctx.user.id) {
          throw new Error("Could not accept friend request");
        } else if (friendRequest.status === "ACCEPTED") {
          return friendRequest;
        }
        const [acceptedFriendRequest] = await ctx.prisma.$transaction([
          ctx.prisma.friendRequest.update({
            where: { id: friendRequestId },
            data: { status: "ACCEPTED" },
          }),
          ctx.prisma.friendship.create({
            data: {
              users: {
                connect: [
                  { id: friendRequest.fromId },
                  { id: friendRequest.toId },
                ],
              },
            },
          }),
        ]);
        return acceptedFriendRequest;
      },
    });

    t.field("friendRequestReject", {
      type: FriendRequest,
      shield: isAuthenticated(),
      args: { friendRequestId: nonNull(stringArg()) },
      resolve: async (_root, { friendRequestId }, ctx) => {
        if (!ctx.user) {
          return null;
        }
        const friendRequest = await ctx.prisma.friendRequest.findUnique({
          where: { id: friendRequestId },
          rejectOnNotFound: true,
        });
        if (friendRequest.toId !== ctx.user.id) {
          throw new Error("Could not reject friend request");
        } else if (friendRequest.status === "ACCEPTED") {
          throw new Error("Cannot reject an accepted friend request");
        }
        const rejectedFriendRequest = ctx.prisma.friendRequest.update({
          where: { id: friendRequestId },
          data: { status: "REJECTED" },
        });
        return rejectedFriendRequest;
      },
    });
  },
});

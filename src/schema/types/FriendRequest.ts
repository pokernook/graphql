import { intArg, mutationField, nonNull, objectType, stringArg } from "nexus";

import { isAuthenticated } from "../rules";

export const FriendRequestObject = objectType({
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

export const friendRequestSend = mutationField("friendRequestSend", {
  type: "FriendRequest",
  shield: isAuthenticated(),
  args: {
    username: nonNull(stringArg()),
    discriminator: nonNull(intArg()),
  },
  resolve: async (_root, { username, discriminator }, { prisma, user }) => {
    if (!user) {
      return null;
    }
    const from = user;
    const to = await prisma.user.findUnique({
      where: { Tag: { username, discriminator } },
      rejectOnNotFound: true,
    });
    if (from.id === to.id) {
      throw new Error("You can't friend yourself");
    }
    const friendship = await prisma.friendship.findFirst({
      where: {
        users: { some: { id: from.id } },
        AND: { users: { some: { id: to.id } } },
      },
    });
    if (friendship) {
      throw new Error("You're already friends with that user");
    }
    const existingFriendRequest = await prisma.friendRequest.findUnique({
      where: { fromId_toId: { fromId: from.id, toId: to.id } },
    });
    if (existingFriendRequest?.status === "PENDING") {
      throw new Error("Cannot resend a friend request that is already pending");
    }
    const friendRequest = await prisma.friendRequest.upsert({
      where: { fromId_toId: { fromId: from.id, toId: to.id } },
      create: { fromId: from.id, toId: to.id },
      update: { status: "PENDING" },
    });
    return friendRequest;
  },
});

export const friendRequestAccept = mutationField("friendRequestAccept", {
  type: "FriendRequest",
  shield: isAuthenticated(),
  args: { friendRequestId: nonNull(stringArg()) },
  resolve: async (_root, { friendRequestId }, { prisma, user }) => {
    if (!user) {
      return null;
    }
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: friendRequestId },
      rejectOnNotFound: true,
    });
    if (friendRequest.toId !== user.id) {
      throw new Error("Cannot accept a friend request that wasn't sent to you");
    }
    if (friendRequest.status !== "PENDING") {
      throw new Error("Cannot accept a friend that isn't pending");
    }
    const friendship = await prisma.friendship.findFirst({
      where: {
        users: { some: { id: friendRequest.fromId } },
        AND: { users: { some: { id: friendRequest.toId } } },
      },
    });
    if (friendship) {
      return prisma.friendRequest.update({
        where: { id: friendRequestId },
        data: { status: "ACCEPTED" },
      });
    }
    const [acceptedFriendRequest] = await prisma.$transaction([
      prisma.friendRequest.update({
        where: { id: friendRequestId },
        data: { status: "ACCEPTED" },
      }),
      prisma.friendship.create({
        data: {
          users: {
            connect: [{ id: friendRequest.fromId }, { id: friendRequest.toId }],
          },
        },
      }),
    ]);
    return acceptedFriendRequest;
  },
});

export const friendRequestReject = mutationField("friendRequestReject", {
  type: "FriendRequest",
  shield: isAuthenticated(),
  args: { friendRequestId: nonNull(stringArg()) },
  resolve: async (_root, { friendRequestId }, { prisma, user }) => {
    if (!user) {
      return null;
    }
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: friendRequestId },
      rejectOnNotFound: true,
    });
    if (friendRequest.toId !== user.id) {
      throw new Error("Cannot reject a friend request that wasn't sent to you");
    }
    if (friendRequest.status !== "PENDING") {
      throw new Error("Cannot reject a friend request that isn't pending");
    }
    const rejectedFriendRequest = prisma.friendRequest.update({
      where: { id: friendRequestId },
      data: { status: "REJECTED" },
    });
    return rejectedFriendRequest;
  },
});

export const friendRequestCancel = mutationField("friendRequestCancel", {
  type: "FriendRequest",
  shield: isAuthenticated(),
  args: { friendRequestId: nonNull(stringArg()) },
  resolve: async (_root, { friendRequestId }, { prisma, user }) => {
    if (!user) {
      return null;
    }
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: friendRequestId },
      rejectOnNotFound: true,
    });
    if (friendRequest.fromId !== user.id) {
      throw new Error("Cannot cancel a friend request you didn't send");
    }
    if (friendRequest.status !== "PENDING") {
      throw new Error("Cannot cancel a friend request that isn't pending");
    }
    const cancelledFriendRequest = prisma.friendRequest.update({
      where: { id: friendRequestId },
      data: { status: "CANCELLED" },
    });
    return cancelledFriendRequest;
  },
});

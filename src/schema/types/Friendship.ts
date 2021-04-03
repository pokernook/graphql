import { mutationField, nonNull, objectType, stringArg } from "nexus";

import { isAuthenticated } from "../rules";

export const FriendshipObject = objectType({
  name: "Friendship",
  definition(t) {
    t.model.createdAt();
    t.model.id();
    t.model.users();
  },
});

export const friendshipDelete = mutationField("friendshipDelete", {
  type: "Friendship",
  shield: isAuthenticated(),
  args: { friendshipId: nonNull(stringArg()) },
  resolve: async (_root, { friendshipId }, { prisma, user }) => {
    if (!user) {
      return null;
    }
    await prisma.friendship.findFirst({
      where: {
        id: friendshipId,
        users: { some: { id: user.id } },
      },
      rejectOnNotFound: true,
    });
    const deletedFriendship = await prisma.friendship.delete({
      where: { id: friendshipId },
    });
    return deletedFriendship;
  },
});

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
  resolve: async (_root, { friendshipId }, ctx) => {
    if (!ctx.user) {
      return null;
    }
    await ctx.prisma.friendship.findFirst({
      where: {
        id: friendshipId,
        users: { some: { id: ctx.user.id } },
      },
      rejectOnNotFound: true,
    });
    const deletedFriendship = await ctx.prisma.friendship.delete({
      where: { id: friendshipId },
    });
    return deletedFriendship;
  },
});

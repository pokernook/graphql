import { objectType } from "nexus";

export const Friendship = objectType({
  name: "Friendship",
  definition(t) {
    t.model.createdAt();
    t.model.id();
    t.model.users();
  },
});

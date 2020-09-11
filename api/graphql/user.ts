import { schema } from "nexus";

schema.objectType({
  name: "User",
  definition(t) {
    t.id("id");
    t.string("email");
  },
});

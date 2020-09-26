import { schema } from "nexus";

schema.objectType({
  name: "User",
  definition(t) {
    t.model.id();
    t.model.email();
  },
});

schema.extendType({
  type: "Query",
  definition(t) {
    t.crud.user();
    t.crud.users();
  },
});

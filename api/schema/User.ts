import { hash, argon2id } from "argon2";
import { schema } from "nexus";

schema.objectType({
  name: "User",
  definition(t) {
    t.model.id();
    t.model.email();
  },
});

schema.objectType({
  name: "AuthPayload",
  definition(t) {
    t.string("token");
    t.field("user", { type: "User" });
  },
});

schema.extendType({
  type: "Query",
  definition(t) {
    t.crud.user();
    t.crud.users();
  },
});

schema.extendType({
  type: "Mutation",
  definition(t) {
    t.field("register", {
      type: "AuthPayload",
      args: {
        email: schema.stringArg({ required: true }),
        password: schema.stringArg({ required: true }),
      },
      resolve: async (_root, { email, password }, ctx) => {
        const hashedPassword = await hash(password, { type: argon2id });
        return null;
      },
    });
  },
});

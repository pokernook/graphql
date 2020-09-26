import { hash, argon2id } from "argon2";
import { sign } from "jsonwebtoken";
import { schema } from "nexus";
import { config } from "../config";

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

// TODO: Email should be checked for validity somewhere
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
        const passwordHash = await hash(password, { type: argon2id });
        const user = await ctx.db.user.create({
          data: { email, passwordHash },
        });
        return {
          token: sign({ userId: user.id }, config.appSecret),
          user,
        };
      },
    });
  },
});

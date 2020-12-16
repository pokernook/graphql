import { argon2id, hash, verify } from "argon2";
import Joi from "joi";
import { extendType, nonNull, objectType, stringArg } from "nexus";

import { uniqueDiscriminator } from "./util";

export const AuthToken = objectType({
  name: "AuthPayload",
  definition(t) {
    t.field("user", { type: "User" });
  },
});

export const User = objectType({
  name: "User",
  definition(t) {
    t.model.id();
    t.model.email();
    t.model.username();
    t.model.discriminator();
  },
});

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    t.crud.user();
    t.crud.users();
  },
});

export const UserMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("signUp", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        username: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      argSchema: Joi.object({
        email: Joi.string().email(),
        username: Joi.string().min(3).max(20).trim(),
        password: Joi.string().min(8),
      }),
      resolve: async (_root, { email, username, password }, ctx) => {
        const discriminator = await uniqueDiscriminator(ctx.prisma, username);
        if (discriminator === undefined) {
          throw new Error("Too many users have this username");
        }
        const passwordHash = await hash(password, { type: argon2id });
        const user = await ctx.prisma.user.create({
          data: { discriminator, email, passwordHash, username },
        });
        return { user };
      },
    });

    t.field("logIn", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_root, { email, password }, ctx) => {
        const errMsg = "Invalid login credentials";
        const user = await ctx.prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error(errMsg);
        }
        const validPassword = await verify(user.passwordHash, password);
        if (!validPassword) {
          throw new Error(errMsg);
        }
        return { user };
      },
    });
  },
});

import { extendType, objectType, stringArg } from "@nexus/schema";
import { argon2id, hash, verify } from "argon2";
import Joi from "joi";

import { signToken, uniqueDiscriminator } from "./util";

export const AuthToken = objectType({
  name: "AuthPayload",
  definition(t) {
    t.string("token");
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
    t.field("register", {
      type: "AuthPayload",
      args: {
        email: stringArg({ required: true }),
        username: stringArg({ required: true }),
        password: stringArg({ required: true }),
      },
      argSchema: Joi.object({
        email: Joi.string().email().required(),
        username: Joi.string().min(3).max(20).trim().required(),
        password: Joi.string().min(8).required(),
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
        return {
          token: signToken(user.id),
          user,
        };
      },
    });

    t.field("signIn", {
      type: "AuthPayload",
      args: {
        email: stringArg({ required: true }),
        password: stringArg({ required: true }),
      },
      resolve: async (_root, { email, password }, ctx) => {
        const errMsg = "Invalid sign in credentials";
        const user = await ctx.prisma.user.findOne({ where: { email } });
        if (!user) {
          throw new Error(errMsg);
        }
        const validPassword = await verify(user.passwordHash, password);
        if (!validPassword) {
          throw new Error(errMsg);
        }
        return {
          token: signToken(user.id),
          user,
        };
      },
    });
  },
});

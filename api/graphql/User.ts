import { extendType, objectType, stringArg } from "@nexus/schema";
import { argon2id, hash, verify } from "argon2";
import { randomInt } from "crypto";
import { sign } from "jsonwebtoken";

import { config } from "../config";

export const User = objectType({
  name: "User",
  definition(t) {
    t.model.id();
    t.model.email();
    t.model.username();
    t.model.discriminator();
  },
});

export const AuthToken = objectType({
  name: "AuthPayload",
  definition(t) {
    t.string("token");
    t.field("user", { type: "User" });
  },
});

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    t.crud.user();
    t.crud.users();
  },
});

const signToken = (userId: string): string =>
  sign({ userId }, config.appSecret);

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
      resolve: async (_root, { email, username, password }, ctx) => {
        let discriminator = undefined;
        const possibleDiscriminators = [...Array(5)].map(() =>
          randomInt(10000)
        );
        for (const d of possibleDiscriminators) {
          const existingUserCount = await ctx.prisma.user.count({
            where: {
              AND: [
                { username: { equals: username } },
                { discriminator: { equals: d } },
              ],
            },
          });
          if (existingUserCount === 0) {
            discriminator = d;
            break;
          }
        }
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

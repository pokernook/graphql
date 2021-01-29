import { argon2id, hash, verify } from "argon2";
import Joi from "joi";
import { extendType, nonNull, objectType, stringArg } from "nexus";

import { isAuthenticated } from "../../rules";
import { destroySession, uniqueDiscriminator } from "./util";

export const User = objectType({
  name: "User",
  definition(t) {
    t.model.id();
    t.model.createdAt();
    t.model.email();
    t.model.username();
    t.model.discriminator();
  },
});

export const UserPayload = objectType({
  name: "UserPayload",
  definition(t) {
    t.field("user", { type: User });
  },
});

export const UserLogOutPayload = objectType({
  name: "UserLogOutPayload",
  definition(t) {
    t.string("sessionId");
  },
});

export const Query = extendType({
  type: "Query",
  definition(t) {
    t.crud.user();
    t.crud.users();
    t.field("me", { type: User, resolve: (_root, _args, ctx) => ctx.user });
  },
});

export const Mutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("userSignUp", {
      type: UserPayload,
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
        ctx.req.session.userId = user.id;
        return { user };
      },
    });

    t.field("userLogIn", {
      type: UserPayload,
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
        ctx.req.session.userId = user.id;
        return { user };
      },
    });

    t.field("userLogOut", {
      type: UserLogOutPayload,
      resolve: async (_root, _args, ctx) => {
        const { session } = ctx.req;
        try {
          await destroySession(session);
        } catch (err) {
          throw new Error(err);
        }
        return { sessionId: session.id };
      },
    });

    t.field("userUpdateUsername", {
      type: UserPayload,
      shield: isAuthenticated(),
      args: { newUsername: nonNull(stringArg()) },
      argSchema: Joi.object({
        newUsername: Joi.string().min(3).max(20).trim(),
      }),
      resolve: async (_root, { newUsername }, ctx) => {
        if (newUsername === ctx.user?.username) {
          return { user: ctx.user };
        }

        let discriminator = ctx.user?.discriminator;
        const discriminatorTaken = !!(await ctx.prisma.user.findUnique({
          where: {
            Tag: { username: newUsername, discriminator: discriminator || 0 },
          },
        }));

        if (discriminatorTaken) {
          discriminator = await uniqueDiscriminator(ctx.prisma, newUsername);
          if (discriminator === undefined) {
            throw new Error("Too many users have this username");
          }
        }

        const updatedUser = await ctx.prisma.user.update({
          data: { username: newUsername, discriminator },
          where: { id: ctx.user?.id },
        });

        return { user: updatedUser };
      },
    });

    t.field("userUpdatePassword", {
      type: UserPayload,
      shield: isAuthenticated(),
      args: { newPassword: nonNull(stringArg()) },
      argSchema: Joi.object({
        newPassword: Joi.string().min(8),
      }),
      resolve: async (_root, { newPassword }, ctx) => {
        const newPasswordHash = await hash(newPassword, { type: argon2id });
        const updatedUser = await ctx.prisma.user.update({
          data: { passwordHash: newPasswordHash },
          where: { id: ctx.user?.id },
        });
        return { user: updatedUser };
      },
    });
  },
});

import { PrismaClient } from "@prisma/client";
import { argon2id, hash, verify } from "argon2";
import { randomInt } from "crypto";
import { arg, extendType, nonNull, objectType, stringArg } from "nexus";
import { promisify } from "util";

import { isAuthenticated } from "../rules";
import { EmailAddress } from "./Scalars";

export const User = objectType({
  name: "User",
  definition(t) {
    t.model.createdAt();
    t.model.discriminator();
    t.model.email();
    t.model.emailVerified();
    t.model.id();
    t.model.status();
    t.model.username();
  },
});

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("me", { type: User, resolve: (_root, _args, ctx) => ctx.user });
  },
});

export const UserMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("userSignUp", {
      type: UserAuthPayload,
      args: {
        email: nonNull(arg({ type: EmailAddress })),
        username: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      validate: ({ string }) => ({
        username: string().min(3).max(20).trim(),
        password: string().min(8),
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
      type: UserAuthPayload,
      args: {
        email: nonNull(arg({ type: EmailAddress })),
        password: nonNull(stringArg()),
      },
      resolve: async (_root, { email, password }, ctx) => {
        const e = "Incorrect email or password";
        const user = await ctx.prisma.user.findUnique({ where: { email } });
        if (!user) {
          throw new Error(e);
        }
        const validPassword = await verify(user.passwordHash, password);
        if (!validPassword) {
          throw new Error(e);
        }
        ctx.req.session.userId = user.id;
        return { user };
      },
    });

    t.field("userLogOut", {
      type: UserLogOutPayload,
      resolve: async (_root, _args, ctx) => {
        const { req, user } = ctx;
        const {
          session: { sessionId },
        } = req;
        const destroySession = promisify(req.destroySession.bind(req));
        try {
          await destroySession();
        } catch (err) {
          throw new Error(err);
        }
        return { sessionId, user };
      },
    });

    t.field("userUpdateUsername", {
      type: User,
      shield: isAuthenticated(),
      args: { newUsername: nonNull(stringArg()) },
      validate: ({ string }) => ({
        newUsername: string().min(3).max(20).trim(),
      }),
      resolve: async (_root, { newUsername }, ctx) => {
        if (!ctx.user || newUsername === ctx.user?.username) {
          return ctx.user;
        }
        let discriminator: number | undefined = ctx.user.discriminator;
        const discriminatorTaken = !!(await ctx.prisma.user.findUnique({
          where: {
            Tag: { username: newUsername, discriminator },
          },
        }));
        if (discriminatorTaken) {
          discriminator = await uniqueDiscriminator(ctx.prisma, newUsername);
          if (discriminator === undefined) {
            throw new Error("Too many users have this username");
          }
        }
        const updatedUser = await ctx.prisma.user.update({
          where: { id: ctx.user?.id },
          data: { username: newUsername, discriminator },
        });
        return updatedUser;
      },
    });

    t.field("userUpdatePassword", {
      type: User,
      shield: isAuthenticated(),
      args: {
        currentPassword: nonNull(stringArg()),
        newPassword: nonNull(stringArg()),
      },
      validate: ({ string }) => ({
        currentPassword: string(),
        newPassword: string().min(8),
      }),
      resolve: async (_root, { currentPassword, newPassword }, ctx) => {
        if (!ctx.user) {
          return null;
        }
        const validPassword = await verify(
          ctx.user.passwordHash,
          currentPassword
        );
        if (!validPassword) {
          throw new Error("Incorrect password");
        }
        const newPasswordHash = await hash(newPassword, { type: argon2id });
        const updatedUser = await ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: { passwordHash: newPasswordHash },
        });
        return updatedUser;
      },
    });

    t.field("userUpdateEmail", {
      type: User,
      shield: isAuthenticated(),
      args: {
        newEmail: nonNull(arg({ type: EmailAddress })),
      },
      resolve: async (_root, { newEmail }, ctx) => {
        if (!ctx.user) {
          return null;
        }
        if (ctx.user.email === newEmail) {
          return ctx.user;
        }
        const updatedUser = await ctx.prisma.user.update({
          where: { id: ctx.user.id },
          data: { email: newEmail, emailVerified: false },
        });
        return updatedUser;
      },
    });

    t.field("userDeleteAccount", {
      type: User,
      shield: isAuthenticated(),
      resolve: async (_root, _args, ctx) => {
        const deletedUser = await ctx.prisma.user.delete({
          where: { id: ctx.user?.id },
        });
        return deletedUser;
      },
    });
  },
});

export const UserAuthPayload = objectType({
  name: "UserAuthPayload",
  definition(t) {
    t.field("user", { type: User });
  },
});

export const UserLogOutPayload = objectType({
  name: "UserLogOutPayload",
  definition(t) {
    t.string("sessionId");
    t.field("user", { type: User });
  },
});

const uniqueDiscriminator = async (
  prisma: PrismaClient,
  username: string,
  uniquenessChecks = 5,
  discriminatorMax = 10_000
): Promise<number | undefined> => {
  const possibleDiscriminators = Array.from({ length: uniquenessChecks }, () =>
    randomInt(discriminatorMax)
  );
  for (const discriminator of possibleDiscriminators) {
    const existingUser = await prisma.user.findUnique({
      where: { Tag: { username, discriminator } },
    });
    if (!existingUser) {
      return discriminator;
    }
  }
};

import { PrismaClient } from "@prisma/client";
import { argon2id, hash, verify } from "argon2";
import { randomInt } from "crypto";
import {
  arg,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from "nexus";
import { promisify } from "util";

import { isAuthenticated } from "../rules";

export const UserObject = objectType({
  name: "User",
  definition(t) {
    t.model.createdAt();
    t.model.discriminator();
    t.model.email();
    t.model.emailVerified();
    t.model.friendships();
    t.model.friendRequestsReceived({
      filtering: { status: true },
      pagination: false,
    });
    t.model.friendRequestsSent({
      filtering: { status: true },
      pagination: false,
    });
    t.model.id();
    t.model.status();
    t.model.username();
  },
});

export const UserAuthPayload = objectType({
  name: "UserAuthPayload",
  definition(t) {
    t.field("user", { type: "User" });
  },
});

export const UserLogOutPayload = objectType({
  name: "UserLogOutPayload",
  definition(t) {
    t.string("sessionId");
    t.field("user", { type: "User" });
  },
});

export const me = queryField("me", {
  type: "User",
  resolve: (_root, _args, { user }) => user,
});

export const userSignUp = mutationField("userSignUp", {
  type: UserAuthPayload,
  args: {
    email: nonNull(arg({ type: "EmailAddress" })),
    username: nonNull(stringArg()),
    password: nonNull(stringArg()),
  },
  validate: ({ string }) => ({
    username: string().min(3).max(20).trim(),
    password: string().min(8),
  }),
  resolve: async (_root, { email, username, password }, { prisma, req }) => {
    const discriminator = await uniqueDiscriminator(prisma, username);
    if (discriminator === undefined) {
      throw new Error("Too many users have this username");
    }
    const passwordHash = await hash(password, { type: argon2id });
    const user = await prisma.user.create({
      data: { discriminator, email, passwordHash, username },
    });
    req.session.userId = user.id;
    return { user };
  },
});

export const userLogIn = mutationField("userLogIn", {
  type: UserAuthPayload,
  args: {
    email: nonNull(arg({ type: "EmailAddress" })),
    password: nonNull(stringArg()),
  },
  resolve: async (_root, { email, password }, { prisma, req }) => {
    const e = "Incorrect email or password";
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error(e);
    }
    const validPassword = await verify(user.passwordHash, password);
    if (!validPassword) {
      throw new Error(e);
    }
    req.session.userId = user.id;
    return { user };
  },
});

export const userLogOut = mutationField("userLogOut", {
  type: UserLogOutPayload,
  resolve: async (_root, _args, { req, user }) => {
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

export const userUpdateUsername = mutationField("userUpdateUsername", {
  type: "User",
  shield: isAuthenticated(),
  args: { newUsername: nonNull(stringArg()) },
  validate: ({ string }) => ({
    newUsername: string().min(3).max(20).trim(),
  }),
  resolve: async (_root, { newUsername }, { prisma, user }) => {
    if (!user || newUsername === user?.username) {
      return user;
    }
    let discriminator: number | undefined = user.discriminator;
    const discriminatorTaken = !!(await prisma.user.findUnique({
      where: {
        Tag: { username: newUsername, discriminator },
      },
    }));
    if (discriminatorTaken) {
      discriminator = await uniqueDiscriminator(prisma, newUsername);
      if (discriminator === undefined) {
        throw new Error("Too many users have this username");
      }
    }
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { username: newUsername, discriminator },
    });
    return updatedUser;
  },
});

export const userUpdatePassword = mutationField("userUpdatePassword", {
  type: "User",
  shield: isAuthenticated(),
  args: {
    currentPassword: nonNull(stringArg()),
    newPassword: nonNull(stringArg()),
  },
  validate: ({ string }) => ({
    currentPassword: string(),
    newPassword: string().min(8),
  }),
  resolve: async (
    _root,
    { currentPassword, newPassword },
    { prisma, user }
  ) => {
    if (!user) {
      return null;
    }
    const validPassword = await verify(user.passwordHash, currentPassword);
    if (!validPassword) {
      throw new Error("Incorrect password");
    }
    const newPasswordHash = await hash(newPassword, { type: argon2id });
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });
    return updatedUser;
  },
});

export const userUpdateEmail = mutationField("userUpdateEmail", {
  type: "User",
  shield: isAuthenticated(),
  args: {
    password: nonNull(stringArg()),
    newEmail: nonNull(arg({ type: "EmailAddress" })),
  },
  resolve: async (_root, { password, newEmail }, { prisma, user }) => {
    if (!user) {
      return null;
    }
    const validPassword = await verify(user.passwordHash, password);
    if (!validPassword) {
      throw new Error("Incorrect password");
    }
    if (user.email === newEmail) {
      return user;
    }
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail, emailVerified: null },
    });
    return updatedUser;
  },
});

export const userDeleteAccount = mutationField("userDeleteAccount", {
  type: "User",
  shield: isAuthenticated(),
  resolve: async (_root, _args, { prisma, user }) => {
    if (!user) {
      return null;
    }
    // Use raw SQL until Prisma supports cascade deletes
    const affected = await prisma.$executeRaw`DELETE FROM "User" WHERE id = ${user.id};`;
    return affected === 1 ? user : null;
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

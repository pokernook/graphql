import { PrismaClient } from "@prisma/client";

export type Context = {
  prisma: PrismaClient;
};

export const context = (): Context => ({
  prisma: new PrismaClient(),
});

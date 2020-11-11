import { PrismaClient } from "../../generated/prisma/client";

export type Context = {
  prisma: PrismaClient;
};

export const context = (): Context => ({
  prisma: new PrismaClient(),
});

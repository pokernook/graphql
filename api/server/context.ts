import { PrismaClient } from "@prisma/client";

export type Context = {
  db: PrismaClient;
};

export const context = (): Context => ({
  db: new PrismaClient(),
});

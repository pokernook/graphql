import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

export type Context = {
  prisma: PrismaClient;
};

export const createContext = (): Context => ({
  prisma,
});

import { PrismaClient } from "@prisma/client";
import { Request } from "express";

const prisma = new PrismaClient();

export type Context = {
  prisma: PrismaClient;
  req: Request;
};

export const createContext = (req: Request): Context => ({
  prisma,
  req,
});

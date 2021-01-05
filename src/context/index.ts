import { PrismaClient, User } from "@prisma/client";
import { Request } from "express";

const prisma = new PrismaClient();

export type Context = {
  prisma: PrismaClient;
  req: Request;
  user: User | null;
};

export const createContext = async (req: Request): Promise<Context> => {
  const id = req.session.userId || "";
  const user = await prisma.user.findUnique({ where: { id } });
  return { prisma, req, user };
};

import { PrismaClient, User } from "@prisma/client";
import { FastifyRequest } from "fastify";

const prisma = new PrismaClient();

export type Context = {
  prisma: PrismaClient;
  req: FastifyRequest;
  user: User | null;
};

export const buildContext = async (req: FastifyRequest): Promise<Context> => {
  const id = req.session.userId;
  const user = await prisma.user.findUnique({ where: { id } });
  return { prisma, req, user };
};

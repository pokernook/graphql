import { PrismaClient, User } from "@prisma/client";
import { FastifyRequest } from "fastify";
import { MercuriusContext } from "mercurius";

const prisma = new PrismaClient();

export type Context = ServerContext & MercuriusContext;

type ServerContext = {
  prisma: PrismaClient;
  req: FastifyRequest;
  user: User | null;
};

export const buildContext = async (
  req: FastifyRequest
): Promise<ServerContext> => {
  const id = req.session.userId || "";
  const user = await prisma.user.findUnique({ where: { id } });
  return { prisma, req, user };
};

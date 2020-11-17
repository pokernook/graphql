import { randomInt } from "crypto";
import { sign } from "jsonwebtoken";

import { PrismaClient } from "../../../generated/prisma/client";
import { config } from "../../config";

const DISCRIMINATOR_CHECKS = 5;
const MAX_DISCRIMINATOR = 10000;

export const signToken = (userId: string): string =>
  sign({ userId }, config.appSecret);

export const uniqueDiscriminator = async (
  prisma: PrismaClient,
  username: string
): Promise<number | undefined> => {
  const possibleDiscriminators = [...Array(DISCRIMINATOR_CHECKS)].map(() =>
    randomInt(MAX_DISCRIMINATOR)
  );
  for (const d of possibleDiscriminators) {
    const existingUser = await prisma.user.findOne({
      where: { UserTag: { username, discriminator: d } },
    });
    if (!existingUser) {
      return d;
    }
  }
};

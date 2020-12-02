import { randomInt } from "crypto";
import { sign } from "jsonwebtoken";

import { PrismaClient } from "../../../generated/prisma/client";
import { config } from "../../config";

const MAX_DISCRIMINATOR = 10000;

export const signToken = (userId: string): string =>
  sign({ userId }, config.appSecret);

export const uniqueDiscriminator = async (
  prisma: PrismaClient,
  username: string,
  uniquenessChecks = 5
): Promise<number | undefined> => {
  const possibleDiscriminators = [...Array(uniquenessChecks)].map(() =>
    randomInt(MAX_DISCRIMINATOR)
  );
  for (const discriminator of possibleDiscriminators) {
    const existingUser = await prisma.user.findUnique({
      where: { UserTag: { username, discriminator } },
    });
    if (!existingUser) {
      return discriminator;
    }
  }
};

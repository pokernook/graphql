import { PrismaClient } from "@prisma/client";
import { randomInt } from "crypto";
import { sign } from "jsonwebtoken";

import { config } from "../../config";

export const signToken = (userId: string): string =>
  sign({ userId }, config.appSecret);

export const uniqueDiscriminator = async (
  prisma: PrismaClient,
  username: string,
  uniquenessChecks = 5,
  discriminatorMax = 10000
): Promise<number | undefined> => {
  const possibleDiscriminators = Array.from({ length: uniquenessChecks }, () =>
    randomInt(discriminatorMax)
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

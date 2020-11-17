import { randomInt } from "crypto";
import { sign } from "jsonwebtoken";

import { PrismaClient } from "../../../generated/prisma/client";
import { config } from "../../config";

export const signToken = (userId: string): string =>
  sign({ userId }, config.appSecret);

export const uniqueDiscriminator = async (
  prisma: PrismaClient,
  username: string
): Promise<number | undefined> => {
  const possibleDiscriminators = [...Array(5)].map(() => randomInt(10000));
  for (const d of possibleDiscriminators) {
    const existingUser = await prisma.user.findOne({
      where: { UserTag: { username, discriminator: d } },
    });
    if (!existingUser) {
      return d;
    }
  }
};

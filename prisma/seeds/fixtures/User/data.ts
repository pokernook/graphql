import { UserCreateInput } from "../../../../generated/prisma/client";

const passwordHash = // Translates to 'password'
  "$argon2id$v=19$m=4096,t=3,p=1$awIn+BOIcEF8KhDWVuUBPQ$f6VLaW4X0AmAnBMvdsnFssUjERdPAbpUC4UmrU2AoSk";

export const users: UserCreateInput[] = [
  {
    id: "1",
    email: "test@email.com",
    username: "test",
    discriminator: 0,
    passwordHash,
  },
  {
    id: "2",
    email: "cowbell@email.com",
    username: "cowbell",
    discriminator: 0,
    passwordHash,
  },
];

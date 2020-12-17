import connectRedis from "connect-redis";
import createSession from "express-session";
import Redis from "ioredis";

import { config } from "../config";

declare module "express-session" {
  interface Session {
    userId: string;
  }
}

const redis = new Redis(config.redisUrl);
const RedisStore = connectRedis(createSession);

export const session = createSession({
  cookie: {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: "lax",
    secure: config.env === "production",
  },
  name: "user_session",
  resave: false,
  saveUninitialized: false,
  secret: config.appSecret,
  store: new RedisStore({ client: redis }),
  unset: "destroy",
});

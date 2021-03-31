import Fastify, { FastifyInstance } from "fastify";
import cookie from "fastify-cookie";
import helmet from "fastify-helmet";
import redis from "fastify-redis";
import session from "fastify-session";
import mercurius from "mercurius";
import mqemitterRedis from "mqemitter-redis";

import { buildContext } from "./context";
import { schema } from "./schema";
import { RedisStore } from "./session/redis-store";

declare module "fastify" {
  interface Session {
    userId: string;
  }
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SECRET = process.env.SESSION_SECRET || "";
const PORT = process.env.PORT || "4000";
const REDIS_URL = process.env.REDIS_URL || "";

const build = async () => {
  const app = Fastify();

  await app.register(helmet, {
    contentSecurityPolicy: IS_PRODUCTION ? undefined : false,
  });
  await app.register(cookie);
  await app.register(redis, { url: REDIS_URL });
  await app.register(session, {
    cookie: {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1_000, // 30 days
      sameSite: true,
      secure: IS_PRODUCTION,
    },
    cookieName: "user_session",
    saveUninitialized: false,
    secret: SECRET,
    store: new RedisStore({ client: app.redis }),
  });
  await app.register(mercurius, {
    context: buildContext,
    graphiql: IS_PRODUCTION ? false : "playground",
    jit: 1,
    path: "/",
    schema,
    subscription: {
      context: (_conn, req) => buildContext(req),
      emitter: mqemitterRedis(app.redis.options),
    },
  });

  return app;
};

const launch = (app: FastifyInstance, port: number | string) =>
  app.listen(port, "::", (_e, address) => console.info(`🚀 ${address}`));

build()
  .then((app) => launch(app, PORT))
  .catch((e) => console.error(e));

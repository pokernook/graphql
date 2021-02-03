import Fastify from "fastify";
import cookie from "fastify-cookie";
import helmet from "fastify-helmet";
import session from "fastify-session";
import mercurius from "mercurius";

import { config } from "./config";
import { buildContext } from "./context";
import { schema } from "./schema";

declare module "fastify" {
  interface Session {
    userId: string;
  }
}

const isProduction = () => config.env === "production";

const buildApp = async () => {
  const app = Fastify();

  await app.register(helmet, {
    contentSecurityPolicy: isProduction() ? undefined : false,
  });
  await app.register(cookie);
  await app.register(session, {
    cookie: {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: true,
      secure: isProduction(),
    },
    cookieName: "user_session",
    saveUninitialized: false,
    secret: config.appSecret,
  });
  await app.register(mercurius, {
    context: buildContext,
    graphiql: isProduction() ? false : "playground",
    path: "/",
    schema,
  });

  return app;
};

buildApp()
  .then((app) =>
    app.listen(config.port, "::", (_e, address) =>
      console.info(`🚀 ${address}`)
    )
  )
  .catch((e) => console.error(e));

import Fastify from "fastify";
import helmet from "fastify-helmet";
import mercurius from "mercurius";

import { config } from "./config";
import { schema } from "./schema";

const buildApp = async () => {
  const app = Fastify();

  await app.register(helmet);
  await app.register(mercurius, {
    graphiql: config.env === "production" ? false : "playground",
    schema,
  });

  return app;
};

buildApp()
  .then((app) =>
    app.listen(config.port, (_e, address) => console.info(`🚀 ${address}`))
  )
  .catch((e) => console.error(e));

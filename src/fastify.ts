import Fastify from "fastify";
import mercurius from "mercurius";

import { config } from "./config";
import { schema } from "./schema";

const buildApp = async () => {
  const app = Fastify();

  await app.register(mercurius, { schema });

  return app;
};

buildApp()
  .then((app) =>
    app.listen(config.port, (_e, address) => console.info(`🚀 ${address}`))
  )
  .catch((e) => console.error(e));

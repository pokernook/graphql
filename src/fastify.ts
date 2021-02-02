import Fastify from "fastify";

import { config } from "./config";

const buildApp = async () => {
  const app = Fastify();

  return app;
};

buildApp()
  .then((app) =>
    app.listen(config.port, (_e, address) => console.info(`🚀 ${address}`))
  )
  .catch((e) => console.error(e));

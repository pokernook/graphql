import createExpress from "express";
import { config } from "./config";
import { server } from "./server";

const app = createExpress();

server.applyMiddleware({ app });

app.listen(config.port, () => {
  console.log(`🚀 Server ready at http://localhost:${config.port}`);
});

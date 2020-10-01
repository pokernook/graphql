import { ApolloServer } from "apollo-server-express";
import createExpress from "express";
import { context } from "./context";
import { config } from "./config";
import { schema } from "./schema";

const app = createExpress();

new ApolloServer({ schema, context }).applyMiddleware({ app });

app.listen(config.port, () => {
  console.log(`🚀 Server ready at http://localhost:${config.port}`);
});

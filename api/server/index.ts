import { ApolloServer } from "apollo-server-express";
import createExpress from "express";
import http from "http";

import { context } from "./context";
import { schema } from "./schema";

const app = createExpress();
const apollo = new ApolloServer({
  context,
  schema,
  subscriptions: { path: "/" },
});
export const server = http.createServer(app);

apollo.applyMiddleware({ app, path: "/" });
apollo.installSubscriptionHandlers(server);

import { ApolloServer } from "apollo-server-express";
import createExpress from "express";
import http from "http";

import { createContext } from "../context";
import { schema } from "../schema";

const app = createExpress();
const apollo = new ApolloServer({
  context: ({ req }) => createContext(req),
  schema,
  subscriptions: { path: "/" },
});
export const server = http.createServer(app);

apollo.applyMiddleware({ app, path: "/" });
apollo.installSubscriptionHandlers(server);

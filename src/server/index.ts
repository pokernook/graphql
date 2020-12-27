import { ApolloServer } from "apollo-server-express";
import createExpress from "express";
import http from "http";

import { createContext } from "../context";
import { schema } from "../schema";
import { session } from "./session";

const app = createExpress();
app.use(session);
export const server = http.createServer(app);

const apollo = new ApolloServer({
  context: ({ req }) => createContext(req),
  schema,
  subscriptions: { path: "/" },
});
apollo.applyMiddleware({
  app,
  path: "/",
});
apollo.installSubscriptionHandlers(server);

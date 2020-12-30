import { ApolloServer } from "apollo-server-express";
import createExpress from "express";
import createHelmet from "helmet";
import http from "http";

import { config } from "../config";
import { createContext } from "../context";
import { schema } from "../schema";
import { session } from "./session";

const app = createExpress();
const helmet = createHelmet({
  // Disable CSP outside production so that GraphQL Playground loads
  contentSecurityPolicy: config.env === "production" ? undefined : false,
});
app.use(helmet);
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

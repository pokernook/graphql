import { ApolloServer } from "apollo-server-express";
import createExpress from "express";
import createSession from "express-session";
import http from "http";

import { config } from "../config";
import { createContext } from "../context";
import { schema } from "../schema";

const app = createExpress();
const session = createSession({
  // TODO: Switch away from in-memory session store
  cookie: {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: "lax",
    secure: config.env === "production",
  },
  name: "user_session",
  resave: false,
  saveUninitialized: false,
  secret: config.appSecret,
  unset: "destroy",
});
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

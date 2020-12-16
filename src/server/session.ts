import createSession from "express-session";

import { config } from "../config";

declare module "express-session" {
  interface Session {
    userId: string;
  }
}

// TODO: Move away from in-memory store
export const session = createSession({
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

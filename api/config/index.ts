import env from "env-var";

export const config = {
  appSecret: env.get("APP_SECRET").default("").asString(),
  env: env.get("NODE_ENV").default("development").asString(),
  port: env.get("PORT").default(4000).asPortNumber(),
};

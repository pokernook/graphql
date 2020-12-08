export const config = {
  appSecret: process.env.APP_SECRET || "",
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "4000", 10),
};

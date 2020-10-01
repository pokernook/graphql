export const config = {
  appSecret: process.env.APP_SECRET || "",
  port: parseInt(process.env.PORT || "", 10) || 3000,
};

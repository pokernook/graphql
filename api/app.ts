import createExpress from "express";
import serverless from "serverless-http";
import { server } from "./server";

export const app = createExpress();
export const graphqlFunc = serverless(app);

server.applyMiddleware({ app, path: "/" });

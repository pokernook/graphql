import createExpress from "express";

import { server } from "./server";

export const app = createExpress();

server.applyMiddleware({ app, path: "/" });

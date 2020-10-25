import { ApolloServer } from "apollo-server-express";
import createExpress from "express";

import { context } from "./context";
import { schema } from "./schema";

export const server = createExpress();
const apollo = new ApolloServer({ context, schema });

apollo.applyMiddleware({ app: server, path: "/" });

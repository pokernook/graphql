import { ApolloServer } from "apollo-server-express";
import createExpress from "express";
import { schema } from "./schema";

const apollo = new ApolloServer({ schema });
export const server = createExpress();

apollo.applyMiddleware({ app: server });

import { ApolloServer } from "apollo-server-express";

import { context } from "./context";
import { schema } from "./schema";

export const server = new ApolloServer({ context, schema });

import { ApolloServer } from "apollo-server-express";
import createExpress from "express";
import { config } from "./config";
import { schema } from "./schema";

const apollo = new ApolloServer({ schema });
const app = createExpress();

apollo.applyMiddleware({ app });

app.listen(config.port, () => {
  console.log(`🚀 Server ready at http://localhost:${config.port}`);
});

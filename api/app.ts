import app, { use } from "nexus";
import { prisma } from "nexus-plugin-prisma";
import serverless from "serverless-http";
import "./graphql"; // Force injection of schema into app bundle

use(
  prisma({
    paginationStrategy: "prisma",
    features: {
      crud: true,
    },
  })
);

app.assemble();

export const graphqlFunc = serverless(app.server.express);

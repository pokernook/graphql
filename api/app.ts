import app, { settings, use } from "nexus";
import { prisma } from "nexus-plugin-prisma";
import serverless from "serverless-http";
import "./schema"; // Force injection of schema into app bundle

settings.change({
  schema: {
    generateGraphQLSDLFile: "api/api.graphql",
  },
});

use(
  prisma({
    paginationStrategy: "prisma",
    features: { crud: true },
  })
);

app.assemble();

export const graphqlFunc = serverless(app.server.express);

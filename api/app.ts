import app, { settings, use } from "nexus";
import { auth } from "nexus-plugin-jwt-auth";
import { prisma } from "nexus-plugin-prisma";
import serverless from "serverless-http";
import "./schema"; // Force injection of schema into app bundle

const { APP_SECRET } = process.env;

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

use(auth({ appSecret: APP_SECRET }));

app.assemble();

export const graphqlFunc = serverless(app.server.express);

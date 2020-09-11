import { settings, use } from "nexus";
import { prisma } from "nexus-plugin-prisma";

settings.change({
  schema: {
    generateGraphQLSDLFile: "api/schema.graphql",
  },
});

use(
  prisma({
    features: {
      crud: true,
    },
  })
);

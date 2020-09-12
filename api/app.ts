import { use } from "nexus";
import { prisma } from "nexus-plugin-prisma";

// TODO: Don't generate GraphQL schema when deployed

use(
  prisma({
    paginationStrategy: "prisma",
    features: {
      crud: true,
    },
  })
);

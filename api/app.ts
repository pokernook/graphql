import { use } from "nexus";
import { prisma } from "nexus-plugin-prisma";

use(
  prisma({
    paginationStrategy: "prisma",
    features: {
      crud: true,
    },
  })
);

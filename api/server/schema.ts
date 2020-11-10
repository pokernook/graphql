import { makeSchema } from "@nexus/schema";
import { nexusPrisma } from "nexus-plugin-prisma";
import { join } from "path";

import * as types from "../graphql";

export const schema = makeSchema({
  outputs: {
    schema: join(__dirname, "../api.graphql"),
    typegen: join(__dirname, "../../generated/@types/nexus-typegen/index.d.ts"),
  },
  plugins: [
    nexusPrisma({
      experimentalCRUD: true,
      paginationStrategy: "prisma",
      inputs: {
        prismaClient: join(__dirname, "../../generated/prisma/client"),
      },
      outputs: {
        typegen: join(
          __dirname,
          "../../generated/@types/typegen-nexus-plugin-prisma/index.d.ts"
        ),
      },
    }),
  ],
  typegenAutoConfig: {
    sources: [
      {
        alias: "prisma",
        source: join(__dirname, "../../generated/prisma/client/index.d.ts"),
      },
      {
        alias: "ContextModule",
        source: join(__dirname, "./context.ts"),
      },
    ],
    contextType: "ContextModule.Context",
  },
  types,
});

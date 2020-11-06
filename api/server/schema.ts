import { makeSchema } from "@nexus/schema";
import { nexusPrisma } from "nexus-plugin-prisma";
import { join } from "path";

import * as types from "../graphql";

export const schema = makeSchema({
  outputs: {
    schema: join(__dirname, "../api.graphql"),
    typegen: join(
      __dirname,
      "../../node_modules/@types/nexus-typegen/index.d.ts"
    ),
  },
  plugins: [
    nexusPrisma({
      experimentalCRUD: true,
      paginationStrategy: "prisma",
    }),
  ],
  typegenAutoConfig: {
    sources: [
      {
        alias: "prisma",
        source: require.resolve(".prisma/client/index.d.ts"),
      },
      {
        alias: "ContextModule",
        source: require.resolve("./context"),
      },
    ],
    contextType: "ContextModule.Context",
  },
  types,
});

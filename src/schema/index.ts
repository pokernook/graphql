import { makeSchema } from "nexus";
import { nexusPrisma } from "nexus-plugin-prisma";
import { join } from "path";

import * as types from "../graphql";
import { argValidation } from "../plugins";

export const schema = makeSchema({
  contextType: {
    export: "Context",
    module: join(__dirname, "../context.ts"),
  },
  outputs: {
    schema: true,
    typegen: join(
      __dirname,
      "../../node_modules/@types/nexus-typegen/index.d.ts"
    ),
  },
  plugins: [
    argValidation(),
    nexusPrisma({
      experimentalCRUD: true,
      paginationStrategy: "prisma",
    }),
  ],
  sourceTypes: {
    modules: [
      {
        alias: "prisma",
        module: require.resolve(".prisma/client/index.d.ts"),
      },
    ],
  },
  types,
});

import { makeSchema } from "nexus";
import { nexusPrisma } from "nexus-plugin-prisma";
import { join } from "path";

import * as types from "../graphql";
import { argValidation } from "../plugins";

const genBase = join(__dirname, "../../generated");

export const schema = makeSchema({
  contextType: {
    export: "Context",
    module: join(__dirname, "../context.ts"),
  },
  outputs: {
    schema: true,
    typegen: join(genBase, "@types/nexus-typegen/index.d.ts"),
  },
  plugins: [
    argValidation(),
    nexusPrisma({
      experimentalCRUD: true,
      paginationStrategy: "prisma",
      inputs: {
        prismaClient: join(genBase, "prisma/client"),
      },
      outputs: {
        typegen: join(genBase, "@types/nexus-prisma-typegen/index.d.ts"),
      },
    }),
  ],
  sourceTypes: {
    modules: [
      {
        alias: "prisma",
        module: join(genBase, "prisma/client/index.d.ts"),
      },
    ],
  },
  types,
});

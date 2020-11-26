import { makeSchema } from "@nexus/schema";
import { nexusPrisma } from "nexus-plugin-prisma";
import { join } from "path";

import * as types from "../graphql";
import { argValidation } from "../plugins";

const genBase = join(__dirname, "../../generated");

export const schema = makeSchema({
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
  typegenAutoConfig: {
    sources: [
      {
        alias: "prisma",
        source: join(genBase, "prisma/client/index.d.ts"),
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

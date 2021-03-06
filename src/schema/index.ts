import { makeSchema } from "nexus";
import { nexusPrisma } from "nexus-plugin-prisma";
import { allow, nexusShield } from "nexus-shield";
import { validatePlugin } from "nexus-validate";
import { join } from "path";

import * as types from "./types";

export const schema = makeSchema({
  contextType: {
    export: "Context",
    module: join(__dirname, "../context"),
  },
  outputs: {
    schema: true,
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
    nexusShield({
      defaultError: new Error("Not authorized"),
      defaultRule: allow,
    }),
    validatePlugin(),
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

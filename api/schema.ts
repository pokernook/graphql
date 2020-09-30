import { DateTimeResolver, JSONObjectResolver } from "graphql-scalars";
import { makeSchema } from "@nexus/schema";
import { nexusPrisma } from "nexus-plugin-prisma";
import { join } from "path";

export const schema = makeSchema({
  outputs: {
    schema: join(__dirname, "api.graphql"),
    typegen: join(__dirname, "nexus-typegen.ts"),
  },
  plugins: [
    nexusPrisma({
      experimentalCRUD: true,
      paginationStrategy: "prisma",
      scalars: {
        DateTime: DateTimeResolver,
        Json: JSONObjectResolver,
      },
    }),
  ],
  typegenAutoConfig: {
    sources: [
      { alias: "prisma", source: require.resolve(".prisma/client/index.d.ts") },
      { alias: "ContextModule", source: require.resolve("./context") },
    ],
    contextType: "ContextModule.Context",
  },
  types: [],
});

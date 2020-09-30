import { makeSchema } from "@nexus/schema";
import { join } from "path";

export const schema = makeSchema({
  types: [],
  outputs: {
    schema: join(__dirname, "api.graphql"),
    typegen: join(__dirname, "nexus-typegen.ts"),
  },
});

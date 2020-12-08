import { plugin } from "@nexus/schema";
import {
  NexusPlugin,
  printedGenTyping,
  printedGenTypingImport,
} from "@nexus/schema/dist/core";
import Joi from "joi";

const ArgSchemaResolverImport = printedGenTypingImport({
  module: "joi",
  bindings: [["Schema", "JoiSchema"]],
});

const fieldDefTypes = printedGenTyping({
  optional: true,
  name: "argSchema",
  description: "A joi schema to validate resolver args against",
  type: "JoiSchema",
  imports: [ArgSchemaResolverImport],
});

export const argValidation = (): NexusPlugin =>
  plugin({
    name: "nexus-plugin-arg-validation",
    description: "Validate resolver arguments against a joi schema",
    fieldDefTypes,
    onCreateFieldResolver(config) {
      const nexusConfig =
        config.fieldConfig.extensions?.nexus
          ?.config; /*  as Record<string, unknown> */
      const argSchema = nexusConfig.argSchema as Joi.Schema;

      if (argSchema && !Joi.isSchema(argSchema)) {
        console.error(
          new Error(
            `No validate() function found on argSchema; expected joi.Schema type but found ${typeof argSchema}`
          )
        );
        return;
      }

      return (root, args, ctx, info, next) => {
        const { error } = argSchema
          ? argSchema.validate(args)
          : Joi.string().validate(undefined);

        if (error) {
          throw new Error(error.details[0]?.message);
        }

        next(root, args, ctx, info);
      };
    },
  });

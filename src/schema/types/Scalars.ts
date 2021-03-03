import emojiRegexRGI from "emoji-regex/RGI_Emoji";
import { Kind } from "graphql";
import { EmailAddressResolver } from "graphql-scalars";
import { asNexusMethod, scalarType } from "nexus";

export const EmailAddress = asNexusMethod(
  EmailAddressResolver,
  "emailAddress",
  "string"
);

export const EmojiSingular = scalarType({
  name: "EmojiSingular",
  asNexusMethod: "emojiSingular",
  description: "One emoji character",
  sourceType: "string",
  parseValue: (value: string) => value,
  serialize: (value: string) => value,
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) {
      throw new Error(`Expected string, got ${ast.kind}`);
    }
    const emojiRegex = emojiRegexRGI();
    const firstMatch = emojiRegex.exec(ast.value)?.[0];
    if (firstMatch !== ast.value) {
      throw new Error("Invalid emoji");
    }
    return ast.value;
  },
});

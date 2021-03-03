import emojiRegexRGI from "emoji-regex/RGI_Emoji";
import { Kind } from "graphql";
import { scalarType } from "nexus";

export const UserStatusEmoji = scalarType({
  name: "UserStatusEmoji",
  asNexusMethod: "userStatusEmoji",
  description: "An emoji summarizing the user's status",
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
      throw new Error("Invalid status emoji");
    }
    return ast.value;
  },
});

import { sign } from "jsonwebtoken";
import { config } from "../config";

export const signToken = (userId: string): string =>
  sign({ userId }, config.appSecret);

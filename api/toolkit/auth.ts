import jwt from "jsonwebtoken";
import { config } from "../config";

export const signToken = (userId: string): string =>
  jwt.sign({ userId }, config.appSecret);

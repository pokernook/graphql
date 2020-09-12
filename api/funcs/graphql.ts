import { APIGatewayProxyHandler } from "aws-lambda";
import { createServer, proxy } from "aws-serverless-express";
import { Server } from "http";
import app from "nexus";
import "../app";
// TODO: Improve schema import syntax
import "../graphql/user";

let cachedServer: Server;

export const handler: APIGatewayProxyHandler = (event, context) => {
  app.assemble();
  if (!cachedServer) {
    cachedServer = createServer(app.server.handlers.graphql);
  }
  return proxy(cachedServer, event, context, "PROMISE").promise;
};

FROM node:15.12.0-alpine AS node

FROM node AS build
WORKDIR /build
COPY . .
RUN npm ci && npm run build

FROM node AS app
WORKDIR /app
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/dist ./dist
CMD ["node", "dist/src"]

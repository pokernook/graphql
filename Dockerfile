FROM node:15.5.0 AS build
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run generate && npm run build

FROM node:15.5.0-alpine AS app
WORKDIR /app
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/dist ./dist
CMD ["node", "dist"]

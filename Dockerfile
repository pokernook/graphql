FROM node:15.2.0-alpine AS node

FROM node AS develop
WORKDIR /develop
COPY package*.json ./
RUN npm ci
COPY . .

FROM node AS build
WORKDIR /build
COPY --from=develop /develop .
RUN npm run build \
  && cp prisma/schema.prisma dist

FROM node AS app
WORKDIR /app
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/dist ./dist
CMD ["node", "dist"]

FROM node:15.5.1 AS develop
WORKDIR /develop
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run generate

FROM node:15.5.1-alpine AS build
WORKDIR /build
COPY --from=develop /develop .
RUN npm run build

FROM node:15.5.1-alpine AS app
WORKDIR /app
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/dist ./dist
CMD ["node", "dist"]

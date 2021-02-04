FROM node:15.8.0-alpine AS node

FROM node AS develop
WORKDIR /develop
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node AS app
WORKDIR /app
COPY --from=develop /develop/node_modules ./node_modules
COPY --from=develop /develop/dist ./dist
CMD ["node", "dist/src"]

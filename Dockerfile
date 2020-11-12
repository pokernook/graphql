# TODO: Reduce container size
FROM node:15.1.0-slim

RUN apt-get update && apt-get -y install openssl

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run prisma:generate \
  && npm run nexus:reflect \
  && npm run build \
  && cp prisma/schema.prisma dist

CMD ["node", "dist"]

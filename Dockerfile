FROM node:15.1.0-slim

WORKDIR /app

RUN apt-get update && apt-get -y install openssl

COPY package*.json ./

COPY prisma prisma

RUN npm ci

COPY . .

RUN npm run build

CMD ["node", ".build/api"]

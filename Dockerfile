FROM node:15.2.0-slim

RUN apt-get update && apt-get -y install openssl

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["node", ".build/api"]

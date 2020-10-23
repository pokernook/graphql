FROM node:15-alpine

WORKDIR /app

COPY package*.json ./

COPY prisma prisma

RUN npm ci

COPY . .

RUN npm run build

CMD ["node", ".build/api"]

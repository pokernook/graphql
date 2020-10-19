FROM node:14-buster AS builder

WORKDIR /app

COPY package*.json ./

COPY prisma prisma

RUN npm ci

COPY . .

RUN npm run build

FROM node:14-alpine

WORKDIR /app

COPY --from=builder /app/.build .build

COPY --from=builder /app/node_modules node_modules

EXPOSE 3000

CMD ["node", ".build/api"]

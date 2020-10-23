FROM node:15-alpine

WORKDIR /app

COPY package*.json ./

COPY prisma prisma

RUN apk --no-cache --virtual build-dependencies add \
  python \
  make \
  g++ \
  && npm ci \
  && apk del build-dependencies

COPY . .

RUN npm run build

CMD ["node", ".build/api"]

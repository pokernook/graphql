FROM node:15-alpine

WORKDIR /app

COPY package*.json ./

COPY prisma prisma

RUN apk update \
  && apk --no-cache --virtual build-dependencies add python \
  && npm ci \
  && apk del build-dependencies

COPY . .

RUN npm run build

CMD ["node", ".build/api"]

FROM node:15.12.0-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
CMD ["node", "dist/src"]

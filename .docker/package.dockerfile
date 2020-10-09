FROM amazonlinux:2

WORKDIR /app

COPY . .

RUN curl --silent --location https://rpm.nodesource.com/setup_12.x | bash - && \
  yum -y install nodejs && \
  npm ci && \
  npm run build:serverless && \
  npx serverless package

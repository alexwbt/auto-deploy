FROM node:22-alpine3.21

RUN apk update && apk add git
RUN git config --global user.name "auto-deploy"
RUN git config --global user.email "auto-deploy@livelyimpact.com"

WORKDIR /app

COPY package-lock.json .
COPY package.json .
RUN npm ci

COPY tsconfig.json .
COPY index.js .

COPY package ./package
COPY src ./src

COPY .gitignore .
RUN git init && git add . && git commit -m "initial commit"

ARG COMMIT_HASH
ENV COMMIT_HASH=$COMMIT_HASH
LABEL commit_hash=$COMMIT_HASH

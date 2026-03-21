FROM node:22.17.0-alpine3.21 AS app-builder
WORKDIR /usr/app

COPY src           ./src
COPY .yarnrc.yml   ./
COPY package.json  ./
COPY tsconfig.json ./
COPY yarn.lock     ./

RUN corepack enable

RUN yarn install
RUN yarn build


FROM node:22.17.0-alpine3.21 AS app
WORKDIR /usr/app

RUN apk update && apk add --no-cache ffmpeg font-noto

COPY --from=app-builder /usr/app/dist ./dist

COPY templates     ./templates
COPY .yarnrc.yml   ./
COPY package.json  ./
COPY tsconfig.json ./
COPY yarn.lock     ./

RUN corepack enable

RUN yarn workspaces focus --production

ENTRYPOINT [ "node", "dist/main" ]
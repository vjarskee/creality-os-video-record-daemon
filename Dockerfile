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

FROM alpine:3.21 AS ffmpeg-builder
WORKDIR /root

RUN apk update && apk add --no-cache build-base x264-dev freetype-dev harfbuzz-dev nasm

COPY /vendor/ffmpeg /root/ffmpeg-8.1
WORKDIR /root/ffmpeg-8.1

RUN chmod +x configure && ./configure \
  --enable-gpl \
  --enable-version3 \
  --enable-static \
  --disable-swscale-alpha \
  --disable-unstable \
  --disable-autodetect \
  --disable-ffplay \
  --disable-ffprobe \
  --disable-doc \
  --disable-htmlpages \
  --disable-manpages \
  --disable-podpages \
  --disable-txtpages \
  --disable-avdevice \
  --disable-swresample \
  --disable-w32threads \
  --disable-os2threads \
  --disable-dwt \
  --disable-lsp \
  --disable-faan \
  --disable-iamf \
  --disable-everything \
  --enable-protocol=file \
  --enable-protocol=http \
  --enable-muxer=mp4 \
  --enable-demuxer=mpjpeg \
  --enable-decoder=mjpeg \
  --enable-encoder=libx264 \
  --enable-libx264 \
  --enable-libfontconfig \
  --enable-libfreetype \
  --enable-libharfbuzz \
  --enable-filter=drawtext

RUN make -j$(nproc)
RUN make install


FROM node:22.17.0-alpine3.21 AS app
WORKDIR /usr/app

RUN apk update && apk add --no-cache font-noto x264-dev harfbuzz-dev

COPY --from=app-builder    /usr/app/dist         ./dist
COPY --from=ffmpeg-builder /usr/local/bin/ffmpeg /usr/local/bin/ffmpeg

COPY templates            ./templates
COPY .yarnrc.yml          ./
COPY docker-entrypoint.sh ./
COPY package.json         ./
COPY tsconfig.json        ./
COPY yarn.lock            ./

RUN chmod +x /usr/app/docker-entrypoint.sh

RUN corepack enable
RUN yarn workspaces focus --production

ENTRYPOINT [ "/usr/app/docker-entrypoint.sh" ]
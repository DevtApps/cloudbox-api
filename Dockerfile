FROM node:alpine AS builder

WORKDIR /app
COPY src src
COPY libs libs

COPY *.json .

RUN npm i -g pnpm

RUN pnpm i

RUN pnpm run build

FROM builder AS dependencies

WORKDIR /app

ENV NODE_ENV=production

COPY package.json .

RUN npm i -g pnpm

RUN pnpm i


FROM gcr.io/distroless/nodejs18-debian11 AS runner

COPY --from=builder /app/dist .
COPY --from=dependencies /app/node_modules node_modules
COPY *.json .

COPY .env .env


EXPOSE 3001

CMD [ "node", "main.js" ]
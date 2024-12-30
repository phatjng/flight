# Build
FROM node:20-slim AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/package.json ./packages/server/
COPY packages/flow/package.json ./packages/flow/

RUN pnpm install --frozen-lockfile

COPY packages/server ./packages/server
COPY packages/flow ./packages/flow

RUN pnpm build

# Production image
FROM node:20-slim AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/server/package.json ./packages/server/
COPY --from=builder /app/packages/flow/package.json ./packages/flow/

COPY --from builder /app/packages/server/dist ./packages/server/dist
COPY --from builder /app/packages/flow/dist ./packages/flow/dist

RUN pnpm install --prod --frozen-lockfile

WORKDIR /app/packages/server

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/main.js"]
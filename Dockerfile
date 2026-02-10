# Stage 1: Build
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config and lockfile first for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY packages/bridge-server/package.json packages/bridge-server/
COPY apps/bridge-ui/package.json apps/bridge-ui/

RUN pnpm install --frozen-lockfile || pnpm install

# Copy source
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY packages/bridge-server/ packages/bridge-server/
COPY apps/bridge-ui/ apps/bridge-ui/

# Build in dependency order
RUN pnpm --filter @uss-claude/shared build
RUN pnpm --filter @uss-claude/bridge-server build
RUN pnpm --filter @uss-claude/bridge-ui build

# Stage 2: Runtime
FROM node:22-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY packages/bridge-server/package.json packages/bridge-server/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Copy built artifacts
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/packages/bridge-server/dist packages/bridge-server/dist
COPY --from=build /app/apps/bridge-ui/dist /app/static

ENV NODE_ENV=production
ENV BRIDGE_HOST=0.0.0.0
ENV BRIDGE_PORT=3420
ENV STATIC_DIR=/app/static

EXPOSE 3420

CMD ["node", "packages/bridge-server/dist/index.js"]

# এক ছবিতে দোকান আর এপিআই। নিজের সার্ভারে (VPS) চালানোর জন্য।
FROM node:24-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@12
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001 SERVE_DIST=1 DATA_DIR=/data
RUN npm install -g pnpm@12
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY server ./server
COPY data/products.json data/seed.json data/content-seed.json ./data/
COPY --from=build /app/dist ./dist
# ফাইল-স্টোর আর ছবির ফোল্ডার, node ব্যবহারকারী যাতে লিখতে পারে
RUN mkdir -p /data && chown node:node /data
VOLUME /data
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:3001/api/health || exit 1
USER node
CMD ["node", "server/index.js"]

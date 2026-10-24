FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:20-alpine
WORKDIR /app
RUN addgroup -S notes-group && adduser -S notes-user -G notes-group
COPY --from=deps --chown=notes-user:notes-group /app/node_modules ./node_modules
COPY --chown=notes-user:notes-group . .
USER notes-user
ENV NODE_ENV=production
EXPOSE 3003
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3003/health || exit 1
CMD ["node", "app.js"]

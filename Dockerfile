# ── FCC CMS PWA ─────────────────────────────────────────────────
# Vue 3 SPA — multi-stage build (Node → nginx)
# Build:  docker build -t fcc-cms-pwa .
# Run:    docker run -p 4173:80 fcc-cms-pwa
# ────────────────────────────────────────────────────────────────

# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite bakes VITE_* env vars at build time
ARG VITE_API_URL=http://localhost:4000/api/v1
ARG VITE_BASE_PATH_PREFIX=/
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BASE_PATH_PREFIX=$VITE_BASE_PATH_PREFIX

RUN npm run build

# ── Stage 2: Serve ──────────────────────────────────────────────
FROM nginx:stable-alpine

# Remove default nginx site
RUN rm /etc/nginx/conf.d/default.conf

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

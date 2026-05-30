# syntax=docker/dockerfile:1.7

# ---------- build stage ----------
# Vite bakes VITE_* env vars into the bundle at build time, so the agent
# ID has to be present here — passing it at container runtime would do
# nothing. Coolify must set ARG VITE_ELEVENLABS_AGENT_ID as a build arg.
FROM node:22-alpine AS build
WORKDIR /app

ARG VITE_ELEVENLABS_AGENT_ID
ENV VITE_ELEVENLABS_AGENT_ID=${VITE_ELEVENLABS_AGENT_ID}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- serve stage ----------
FROM nginx:1.27-alpine AS serve

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

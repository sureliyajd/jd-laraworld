# syntax=docker/dockerfile:1.7
#
# Multi-stage Dockerfile for Vite/React app
#

FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]


FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Allow API base to be provided at build time for production
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build


FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
# SPA fallback can be customized via compose by overriding default.conf if needed
EXPOSE 80



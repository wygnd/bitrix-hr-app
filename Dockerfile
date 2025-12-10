FROM node:lts-alpine AS build-stage

WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm run build

FROM nginx:stable-alpine as prod-stage
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]
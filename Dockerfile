FROM node:18-alpine AS builder
WORKDIR /app

# копируем только нужное
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/. .
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY --from=builder /app/build .

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

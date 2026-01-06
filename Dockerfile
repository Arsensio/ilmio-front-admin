FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# 2) сервим сборку через NGINX
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

# пробрасываем порт
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

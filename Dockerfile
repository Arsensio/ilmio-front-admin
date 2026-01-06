# 1) билдим приложение
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# 2) сервим сборку через nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# удаляем дефолтные файлы nginx
RUN rm -rf ./*

# копируем из стадии билд
COPY --from=builder /app/build .

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

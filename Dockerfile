# Стадия 1 — билд приложения
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем конфиги и устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm install

# Копируем весь код
COPY . .

# Собираем финальные файлы в папку dist/
RUN npm run build

# Стадия 2 — раздаём через Nginx
FROM nginx:alpine

# Удаляем дефолтный nginx контент
RUN rm -rf /usr/share/nginx/html/*

# Копируем собранный frontend из /app/dist
COPY --from=builder /app/dist /usr/share/nginx/html

# Открываем порт 80
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]

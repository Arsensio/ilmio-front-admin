# -------------------------------
# 1) Этап сборки (builder)
# -------------------------------
FROM node:18-alpine AS builder

# Рабочая директория
WORKDIR /app

# Объявляем build-параметр для API-URL
ARG REACT_APP_API_URL

# Пробрасываем его в окружение для сборки
# (React увидит эту переменную во время npm run build)
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Копируем конфиги
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь исходный код
COPY . .

# Собираем проект (React положит файлы в папку dist/)
RUN npm run build

# -------------------------------
# 2) Этап сервера (nginx)
# -------------------------------
FROM nginx:alpine

# Удаляем дефолтные html/nginx файлы
RUN rm -rf /usr/share/nginx/html/*

# Копируем собранный frontend из builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Открываем порт 80
EXPOSE 80

# Запускаем nginx в переднем плане
CMD ["nginx", "-g", "daemon off;"]

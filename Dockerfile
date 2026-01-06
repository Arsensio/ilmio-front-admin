# ---------- BUILD ----------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- NGINX ----------
FROM nginx:alpine

# удаляем дефолтный конфиг
RUN rm /etc/nginx/conf.d/default.conf

# копируем наш nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# копируем билд
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

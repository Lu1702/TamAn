# --- Giai đoạn 1: Build React ---
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Giai đoạn 2: Chạy bằng Nginx ---
FROM nginx:1.25
# Copy file đã build từ giai đoạn 1 vào thư mục của Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy cấu hình nginx (tùy chọn, để fix lỗi router React)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# --- Giai đoạn 1: Build React ---
# Thêm platform để tránh lỗi format exec
FROM --platform=linux/amd64 node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Giai đoạn 2: Chạy bằng Nginx ---
FROM --platform=linux/amd64 nginx:1.25
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Đảm bảo file nginx.conf của bạn đã được chuyển sang định dạng LF
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# Sử dụng platform linux/amd64 để chạy ổn định trên mọi máy
FROM --platform=linux/amd64 node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json để cài thư viện trước (tối ưu cache)
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Mở cổng 5000 (cổng của backend)
EXPOSE 5000

# Lệnh khởi chạy server
CMD ["node", "server.js"]
# 1. Dùng Node.js làm môi trường
FROM node:18-alpine

# 2. Tạo thư mục làm việc trong container
WORKDIR /app

# 3. Copy file package để cài thư viện trước (tối ưu cache)
COPY package*.json ./
RUN npm install

# 4. Copy toàn bộ code backend vào
COPY . .

# 5. Mở port 5000
EXPOSE 5000

# 6. Chạy server
CMD ["node", "server.js"]
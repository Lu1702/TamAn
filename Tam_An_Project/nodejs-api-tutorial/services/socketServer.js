const { Server } = require("socket.io");
const LoggerService = require("./LoggerService");
class SocketServer {
    constructor() {
        if (!SocketServer.instance) {
            this.io = null;
            SocketServer.instance = this;
        }
        return SocketServer.instance;
    }
    init(httpServer) {
        this.io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
        });
        this.io.on("connection", (socket) => {
            LoggerService.logInfo("Socket connected:", socket.id);
            socket.on("disconnect", () => {
                LoggerService.logInfo("Socket disconnected:", socket.id);
            }
            );
        });
    }
    getIO() {
        if (!this.io) {
            throw new Error("Socket.io chưa được khởi tạo. Vui lòng gọi init() trước.");
        }
        return this.io;
    }
}
const instance = new SocketServer();
module.exports = instance;
const sql = require('mssql');
require('dotenv').config();

class Database {
    constructor() {
        if (!Database.instance) {
            this.config = {
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                server: process.env.DB_SERVER || 'localhost',
                database: process.env.DB_NAME,
                options: {
                    encrypt: false,
                    trustServerCertificate: true
                }
            };
            this.pool = null;
            this.poolConnect = null;
            Database.instance = this;
        }
        return Database.instance;
    }

    async connect() {
        try {
            if (!this.pool) {
                this.pool = new sql.ConnectionPool(this.config);
                this.poolConnect = await this.pool.connect();
                console.log("✅ Singleton DB: Đã kết nối SQL Server thành công!");
            }
            return this.pool;
        } catch (err) {
            console.error("❌ Singleton DB: Lỗi kết nối SQL:", err);
            throw err;
        }
    }
    async request() {
        if (!this.pool) {
            await this.connect();
        }
        return this.pool.request();
    }
}
const instance = new Database();

module.exports = instance;
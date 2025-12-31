require('dotenv').config();


class LoggerService {
    constructor() {
        if (!LoggerService.instance) {
            LoggerService.instance = this;
        }
        return LoggerService.instance;
    }
    logInfo(message) {
        const date = new Date().toLocaleString()
        console.log(`\x1b[32m[${date}] INFO:\x1b[0m ${message}`);
    }
    logError(message) {
        console.error(`\x1b[31m[${date}] ERROR:\x1b[0m ${message}`);
    }
}
module.exports = new LoggerService();
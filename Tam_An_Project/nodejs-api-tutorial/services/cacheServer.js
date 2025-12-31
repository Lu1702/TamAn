require('dotenv').config();
class CacheServer {  
    constructor() {
        if(!CacheServer.instance) {
            this.cache = new Map();
            CacheServer.instance = this;
        }
        return CacheServer.instance;
    }
    set(key, value,ttl =60000) {
        this.cache.set(key, value);
        setTimeout(() => {
            console.log("hết thời gian key đang xóa cache:", key);  
            this.cache.delete (key);
        }, ttl);
    }
    get(key) {
        return this.cache.get(key);
    }
    has(key) {
        return this.cache.has(key);
    }
    delete(key) {
        this.cache.delete(key);
    }
    clear() {   
        this.cache.clear();
    }
}
const instance = new CacheServer();
module.exports = instance;
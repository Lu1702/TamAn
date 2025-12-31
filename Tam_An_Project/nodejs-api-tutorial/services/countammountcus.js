require('dotenv').config();
class CountAmmountCus {
    constructor() {
        if(!CountAmmountCus.instance) {
            this.count = 0;
            CountAmmountCus.instance = this;
        }
        return CountAmmountCus.instance;
    }
    increment() {
        this.count += 1;
    }
    getCount() {
        return this.count;
    }
    reset() {  
        this.count = 0;
    }
}
const instance = new CountAmmountCus();
module.exports = instance;
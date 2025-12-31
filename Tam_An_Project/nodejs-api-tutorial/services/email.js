const nodemailer = require('nodemailer');
require('dotenv').config();


class EmailService {
    constructor() {
        if(!EmailService.instance) {
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
            EmailService.instance = this;
        }
        return EmailService.instance;
    }

    async sendEmail(to, subject, text) {
        try {
            const mailOptions = {
                from: '"Tâm An Tea Shop" <no-reply@taman.com>',
                to,
                subject,
                text
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log("✅ Email sent: " + info.response);
            return info;
        }
        catch (error) {
            console.error("❌ Error sending email:", error);
            return null;
        }

    }
}
const instance = new EmailService();    
module.exports = instance;
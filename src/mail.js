import nodemailer from 'nodemailer';

function MailSender(config) {
    const self = this;    
    this.verified = false;
    this.transport = nodemailer.createTransport({
        host: 'smtp.yandex.ru',
        port: 465,
        secure: true,
        auth: {
            user: config.sender,
            pass: config.password
        }
    });
    this.verify = async function() {
        self.verified = false;
        await self.transport.verify();
        self.verified = true;
        console.log("MailSender verified");
    }
    this.send = async function(mail_to, subject, text) {
        if (!self.verified) {
            throw new Error("Mail sender is not verified");
        } 

        const item = {
                from: `"Profi-Raisen Notify" <${config.sender}>`,
                to: mail_to,
                subject: subject,
                text: text
        };
        const result = await self.transport.sendMail(item);
        //todo: research result capabilities
        console.log("Mail sent: %s", result.messageId);
    }
};

export function createSender(config) {
    return new MailSender(config);
}

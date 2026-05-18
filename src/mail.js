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
        try {
            await self.transport.verify();
            self.verified = true;
        } catch (err) {
            console.warn("[Error] mail verify failed: ", err);
        }
    }
    this.send = async function(mail_to, subject, text) {
        if (!self.verified) {
            console.warn('[Error] mail sender is not verified');
            return;
        } 

        try {
            const item = {
                from: `"Profi-Raisen Notify" <${config.sender}>`,
                to: mail_to,
                subject: subject,
                text: text,
                // html: "<b>Hello world?</b>", //todo: need this?
            };
            const result = await self.transport.sendMail(item);
            console.log("Mail sent: %s", result.messageId);
        } 
        catch (err) {
            console.warn("[Error] while mail sending:", err);
        }
    }
};

export function createSender(config) {
    const item = new MailSender(config);
    item.verify().then(() => {
        console.log("Mail verified. Server is ready to send emails");
    });
    return item;
}

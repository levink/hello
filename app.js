const express = require("express");
// const fs = require("fs");
const mysql = require('mysql2');
const nodemailer = require("nodemailer");
const cfg = require("./config");


const app = express();
const config = cfg.parse(process.argv);

if (config.has_errors()) {
    console.log(`[Error] config is not ready`);
    return;
} 

const pool = mysql.createPool({
    host: 'localhost',
    user: config.db_user,
    password: config.db_pass,
    database: config.db_name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

app.use(express.json());
app.use(express.static("public"));
app.post('/api/ask', express.json({limit: '2kb'}), async (request, responce) => {

    if (!request.body) {
        return responce.sendStatus(400);
    }

    //todo: 
    // - check json
    // - save to db
    // - send mail
    responce.sendStatus(200);
});

const server = app.listen(config.port, config.host, () => {
    console.log(`App listening ${config.host}:${config.port}`)
})

async function closeServer() {

    function closeServerOperation() {
        return new Promise((resolve) => {
            server.close(() => {
                resolve();
            });
        });
    }

    console.log('\nSIGINT received: closing the server');

    try {
        await closeServerOperation();
        console.log('Server closed.');

        await pool.end();
        console.log('Database connections closed.');
    }
    catch (error) {
        console.log(`[Error] catch on closing the server : ${error.message}`);
    }
}

process.on('SIGINT', async () => { 
    await closeServer();
    process.exit(0);
});

function MailSender() {
    const self = this;    
    this.verified = false;
    this.transport = nodemailer.createTransport({
        host: 'smtp.yandex.ru',
        port: 465,
        secure: true,
        auth: {
            user: config.notyfy_sender,
            pass: config.notify_pass
        }
    });
    this.verify = async function() {
        try {
            await self.transport.verify();
            self.verified = true;
            console.log("Mail verified. Server is ready to send emails");
        } catch (err) {
            self.verified = false;
            console.error("[Error] mail verify failed: ", err);
        }
    }
    this.send = async function() {
        if (!self.verified) {
            console.log('[Error] mail sender is not verified');
            return;
        } 

        try {
            const info = {
                from: `"Profi-Raisen Notify" <${config.notyfy_sender}>`,
                to: `${config.notify_targets}`,
                subject: "[Request]",
                text: "Hello world 123",
                // html: "<b>Hello world?</b>", //todo: need this?
            };
            const result = await self.transport.sendMail(info);
            console.log("Mail sent: %s", result.messageId);
        } 
        catch (err) {
            console.error("[Error] while mail sending:", err);
        }
    }
};

const mailSender = new MailSender();
mailSender.verify().then(() => {
    // mailSender.send(); // todo: for debug
});


//todo: use express + static content from 'public' dir
// app.use(express.static(__dirname + '/public'));

// const server = http.createServer(function (req, res) {
    
//     const filePath = 'public/' + req.url.substring(1);
//     fs.access(filePath, fs.constants.R_OK, err => {
//         if (err) {
//             res.statusCode = 404;
//             res.end("Not found.");
//         }
//         else {
//             res.statusCode = 200;
//             fs.createReadStream(filePath).pipe(res);
//         }
//     });
// });


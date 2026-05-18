const express = require("express");
// const fs = require("fs");
const mysql = require('mysql2');
const cfg = require("./src/config");
const mail = require("./src/mail");

const app = express();
const config = cfg.parse(process.argv);

if (config.has_errors()) {
    console.warn(`[Error] config is not ready. Stop program`);
    process.exit(0);
    return;
} 

const mailSender = mail.createSender({
    sender: config.notyfy_sender,
    password: config.notify_pass
});

const dbPool = mysql.createPool({
    host: 'localhost',
    user: config.db_user,
    password: config.db_pass,
    database: config.db_name,
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
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
    var ok = false;
    try {
        const id = await db_insertRequest({
            name: 'Bob Dylan', 
            phone: '+7 (999) 123-45-67', 
            email: null, 
            message: 'Call me please!'
        });
        // await mailSender.send(config.notify_targets, "[Test] Hello", "Hello world!");
        ok = (id > 0);
    } 
    catch (error) {
        console.warn(`[Error] catch on create request: ${error.message}`);
    }

    responce.sendStatus(ok ? 200 : 400);
});

async function db_insertRequest(item) {
    try {
        const sql = `INSERT INTO 
            request (name, phone, email, message)
            VALUES (:name, :phone, :email, :message);`;
        const [result] = await dbPool.query(sql, item);
        return result.insertId;
    } 
    catch (error) {
        console.warn(`[Error] on db_insertRequest(): ${error}`);
    }
    
    return -1;
}

const server = app.listen(config.port, config.host, () => {
    console.log(`App listening ${config.host}:${config.port}`)
})

async function closeServer() {

    async function closeServerOperation() {
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

        await dbPool.end();
        console.log('Database connections closed.');
    }
    catch (error) {
        console.warn(`[Error] catch on closing the server : ${error.message}`);
    }
}

process.on('SIGINT', async () => { 
    await closeServer();
    process.exit(0);
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


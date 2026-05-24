const express = require("express");
// const fs = require("fs");
const cfg = require("./config");
const mail = require("./mail");
const db = require("./db");

const app = express();
const config = cfg.parse(process.argv);

if (config.has_errors()) {
    console.warn(`[Error] config is not ready.\nStop program`);
    process.exit(0);
} 

db.open({
    user: config.db_user,
    password: config.db_pass,
    database: config.db_name,
}).catch(error => {
    console.warn(`[Error] can not connect to DB: ${error}.\nStop program`);
    process.exit(0);    
});

const mailSender = mail.createSender({
    sender: config.notyfy_sender,
    password: config.notify_pass
});
mailSender.verify().catch(error => {
    console.warn(`[Error] mail verify failed: ${error}.\nStop program`);
    process.exit(0);
});

app.use(express.json());
app.use(express.static("public"));
app.post('/api/ask', express.json({limit: '2kb'}), async (request, responce) => {

    if (!request.body) {
        return responce.sendStatus(400);
    }

    try {
        //todo: check json
        const row = db.toRow(request.body, request.ip);
        row.id = await db.insertRequest(row);
        console.log(`New request created: id=${row.id} from '${row.ip}'`);

        // todo: refactor this?
        var contact = [row.name, row.phone, row.email].filter(item => item != null).join(", ");
        var title = `[Заявка, ID=${row.id}] ${contact}`;
        await mailSender.send(config.notify_targets, title, row.message);

        responce.sendStatus(200);
    } 
    catch (error) {
        console.warn(`[Error] /api/ask: ${error}`);
        responce.sendStatus(400);
    }
});

const server = app.listen(config.port, config.host, () => {
    console.log(`App listening ${config.host}:${config.port}`)
})

async function closeServer() {

    async function closeServerOperation() {
        return new Promise(resolve => {
            server.close(resolve);
        });
    }

    console.log('\nSIGINT received: closing the server');

    try {
        await closeServerOperation();
        console.log('Server closed.');

        await db.close();
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


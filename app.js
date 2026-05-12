const express = require("express");
const fs = require("fs");
const mysql = require('mysql2');
const cfg = require("./config");


const app = express();
const config = cfg.parse(process.argv);

if (config.has_errors()) {
    console.log(`[Error] config is not ready`);
    return;
} 

const pool = mysql.createPool({
  host:     'localhost',
  user:     config.db_user,
  password: config.db_pass,
  database: config.db_name,
  waitForConnections: true,
  connectionLimit: 10, // Adjust the limit based on your needs
  queueLimit: 0
}).promise();

app.use(express.static("public"));
// app.get('/test', (request, responce) => {
//     responce.sendFile(__dirname + "/public/index.html");
// })

const server = app.listen(config.port, config.host, () => {
    console.log(`App listening ${config.host}:${config.port}`)
})

process.on('SIGINT', () => { 
    console.log('\nSIGINT received: closing server');
    server.close(() => {
        console.log('Server stopped. Closing database connections, etc.');
        pool.end().then(() => {
            console.log('DB pool closed.');
        }).finally(() => {
            process.exit(0);
        });
    });
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


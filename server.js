const http = require('http');
const fs = require("fs");


const host = '127.0.0.1';
const port = 3500;

process.on('SIGINT', () => { 
   console.log('\nSIGINT received: closing server');
    server.close(() => {
        console.log('Server closed. Closing database connections, etc.');
        process.exit(0);
    });
});

const server = http.createServer(function (req, res) {
    
    const filePath = 'site/' + req.url.substring(1);
    fs.access(filePath, fs.constants.R_OK, err => {
        if (err) {
            res.statusCode = 404;
            res.end("Not found.");
        }
        else {
            res.statusCode = 200;
            fs.createReadStream(filePath).pipe(res);
        }
    });
});

server.listen(port, host, () => {
    console.log('Server running...');
});



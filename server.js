const http = require('http');
const host = '127.0.0.1';
const port = 1221;


process.on('SIGINT', () => { 
   console.log('\nSIGINT received: closing server');
    server.close(() => {
        console.log('Server closed. Closing database connections, etc.');
        process.exit(0);
    });
});

const server = http.createServer(function(req, res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.write('Hello World!');
    res.end();
});

server.listen(port, host, () => {
    console.log('Server running...');
});

const http = require('http');          // built-in module, nothing to install

// this function runs for EVERY request the server receives
const server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });   // 200 = OK
    res.end('My Node JS server is running!');               // body + end of the answer
});

server.listen(3012, () => {                // your port
    console.log('Listening on localhost:3012');
});

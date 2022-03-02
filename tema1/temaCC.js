const http = require('http');
const APIReq = require('./APIReq');

const server = http.createServer(APIReq.handler);
server.listen(3000);
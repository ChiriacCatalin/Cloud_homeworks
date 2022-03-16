const http = require("http");
const getMethods = require("./getMethods");
const postMethods = require("./postMethods");
const deleteMethods = require("./deleteMethods");
const putMethods = require("./putMethods");


const server = http.createServer(function (req, res) {
  const meth = req.method;
  if (meth === "GET") {
    getMethods.getResponse(req, res);
  } else if (meth === "POST") {
    postMethods.postResponse(req, res);
  } else if (meth === "DELETE") {
    deleteMethods.deleteResponse(req, res);
  } else if (meth === "PUT"){
    putMethods.putResponse(req, res);
  }
  else {
    res.writeHeader(405, { "Content-Type": "application/json" }); /// other metods not allowed
    res.end();
  }
});

server.listen(3000);

//dependencies
const http = require("http");
const {handleReqRes} = require('./helpers/handleReqRes')
const environment = require('./helpers/environments')
const data = require('./lib/data')

//app object
const app = {};

//create server
app.createTheServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(environment.port, () => {
    console.log(`listening to ${environment.port}`);
  });
};

//handle Req,Res
app.handleReqRes = handleReqRes;

//starting server
app.createTheServer();

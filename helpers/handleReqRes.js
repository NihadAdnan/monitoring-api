//dependencies
const url = require("url");
const { StringDecoder } = require("string_decoder");
const routes = require("../routes");
const {
  notFoundHandler,
} = require("../handlers/routeHandlers/notFoundHandler");
const {parseJson} = require('../helpers/utilities') 

//module scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
  //handle req
  const parsedPath = url.parse(req.url, true);
  const path = parsedPath.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  const method = req.method.toLowerCase();

  const queryObject = parsedPath.query;

  const headers = req.headers;

  const reqProperties = {
    parsedPath,
    path,
    trimmedPath,
    headers,
    queryObject,
    method,
  };

  const decoder = new StringDecoder("utf-8");
  let realData = "";

  const choosenHandler = routes[trimmedPath]
    ? routes[trimmedPath]
    : notFoundHandler;

  req.on("data", (buffer) => {
    realData += decoder.write(buffer);
  });

  req.on("end", () => {
    realData += decoder.end();

    reqProperties.body = parseJson(realData)

    choosenHandler(reqProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 500;
      payload = typeof payload === "object" ? payload : {};

      const payloadString = JSON.stringify(payload);

      //final response
      res.setHeader('Content-Type','application/json')
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};

module.exports = handler;

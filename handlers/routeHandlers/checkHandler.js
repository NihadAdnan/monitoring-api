const data = require("../../lib/data");
const { parseJson, randomString } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");
const { maxCheck } = require("./../../helpers/environments");

//module scaffolding
const handler = {};

handler.checkHandler = (reqProperties, callBack) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(reqProperties.method) > -1) {
    handler._checks[reqProperties.method](reqProperties, callBack);
  } else {
    callBack(405);
  }
};

handler._checks = {};

handler._checks.post = (reqProperties, callBack) => {
  let protocol =
    typeof reqProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(reqProperties.body.protocol) > -1
      ? reqProperties.body.protocol
      : false;

  let url =
    typeof reqProperties.body.url === "string" &&
    reqProperties.body.url.trim().length > 0
      ? reqProperties.body.url
      : false;

  let method =
    typeof reqProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(reqProperties.body.method) > -1
      ? reqProperties.body.method
      : false;

  let successCode =
    typeof reqProperties.body.successCode === "object" &&
    reqProperties.body.successCode instanceof Array
      ? reqProperties.body.successCode
      : false;

  let timeOutSeconds =
    typeof reqProperties.body.timeOutSeconds === "number" &&
    reqProperties.body.timeOutSeconds % 1 == 0 &&
    reqProperties.body.timeOutSeconds >= 1 &&
    reqProperties.body.timeOutSeconds <= 5
      ? reqProperties.body.timeOutSeconds
      : false;

  if (protocol && url && method && successCode && timeOutSeconds) {
    const token =
      typeof reqProperties.headers.token === "string"
        ? reqProperties.headers.token
        : false;

    data.read("tokens", token, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = parseJson(tokenData).phone;

        data.read("users", userPhone, (err2, userData) => {
          if (!err2 && userData) {
            tokenHandler._tokens.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                let userObject = parseJson(userData);
                let userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];

                if (userChecks.length < maxCheck) {
                  let checkID = randomString(20);
                  let checkObject = {
                    id: checkID,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCode,
                    timeOutSeconds,
                  };
                  data.create("checks", checkID, checkObject, (err) => {
                    if (!err) {
                      userObject.checks = userChecks;
                      userObject.checks.push(checkID);

                      data.update("users", userPhone, userObject, (err) => {
                        if (!err) {
                          callBack(200, checkObject);
                        } else {
                          callBack(500, {
                            error: "Error in server",
                          });
                        }
                      });
                    } else {
                      callBack(505, {
                        error: "Error in server",
                      });
                    }
                  });
                } else {
                  callBack(400, {
                    error: "Already use maximum checks",
                  });
                }
              } else {
                callBack(404, {
                  error: "token is not valid",
                });
              }
            });
          } else {
            callBack(400, {
              error: "error in getting data",
            });
          }
        });
      } else {
        callBack(404, {
          error: "Authorization error",
        });
      }
    });
  } else {
    callBack(400, {
      error: "error in request",
    });
  }
};
handler._checks.put = (reqProperties, callBack) => {
  const id =
    typeof reqProperties.body.id === "string" &&
    reqProperties.body.id.trim().length === 20
      ? reqProperties.body.id
      : false;

  let protocol =
    typeof reqProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(reqProperties.body.protocol) > -1
      ? reqProperties.body.protocol
      : false;

  let url =
    typeof reqProperties.body.url === "string" &&
    reqProperties.body.url.trim().length > 0
      ? reqProperties.body.url
      : false;

  let method =
    typeof reqProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(reqProperties.body.method) > -1
      ? reqProperties.body.method
      : false;

  let successCode =
    typeof reqProperties.body.successCode === "object" &&
    reqProperties.body.successCode instanceof Array
      ? reqProperties.body.successCode
      : false;

  let timeOutSeconds =
    typeof reqProperties.body.timeOutSeconds === "number" &&
    reqProperties.body.timeOutSeconds % 1 == 0 &&
    reqProperties.body.timeOutSeconds >= 1 &&
    reqProperties.body.timeOutSeconds <= 5
      ? reqProperties.body.timeOutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCode || timeOutSeconds) {
      data.read("checks", id, (err, checkData) => {
        if (!err && checkData) {
          const checkObject = parseJson(checkData);
          const token =
            typeof reqProperties.headers.token === "string"
              ? reqProperties.headers.token
              : false;

          tokenHandler._tokens.verify(
            token,
            checkObject.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCode) {
                  checkObject.successCode = successCode;
                }
                if (timeOutSeconds) {
                  checkObject.timeOutSeconds = timeOutSeconds;
                }
                data.update("checks", id, checkObject, (err) => {
                  if (!err) {
                    callBack(200);
                  } else {
                    callBack(500, {
                      error: "server side error",
                    });
                  }
                });
              } else {
                callBack(404, {
                  error: "Authorization error",
                });
              }
            }
          );
        } else {
          callBack(500, {
            error: "server side error",
          });
        }
      });
    } else {
      callBack(400, {
        error: "you have to update at least one field",
      });
    }
  } else {
    callBack(404, {
      error: "error in request",
    });
  }
};
handler._checks.get = (reqProperties, callBack) => {
  const id =
    typeof reqProperties.queryObject.id === "string" &&
    reqProperties.queryObject.id.trim().length === 20
      ? reqProperties.queryObject.id
      : false;

  if (id) {
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const token =
          typeof reqProperties.headers.token === "string"
            ? reqProperties.headers.token
            : false;

        tokenHandler._tokens.verify(
          token,
          parseJson(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callBack(200, parseJson(checkData));
            } else {
              callBack(404, {
                error: "Authorization error",
              });
            }
          }
        );
      } else {
        callBack(404, {
          error: "error in request",
        });
      }
    });
  } else {
    callBack(404, {
      error: "error in request",
    });
  }
};
handler._checks.delete = (reqProperties, callBack) => {
    const id =
    typeof reqProperties.queryObject.id === "string" &&
    reqProperties.queryObject.id.trim().length === 20
      ? reqProperties.queryObject.id
      : false;

  if (id) {
    data.read("checks", id, (err, checkData) => {
      if (!err && checkData) {
        const token =
          typeof reqProperties.headers.token === "string"
            ? reqProperties.headers.token
            : false;

        tokenHandler._tokens.verify(
          token,
          parseJson(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              data.delete('checks',id,(err1)=>{
                if(!err1){
                    data.read('users',parseJson(checkData).userPhone,(err2,userData)=>{
                        let userObject = parseJson(userData)
                        if(!err2 && userData){
                            let userChecks = typeof(userObject.checks)==='object' && userObject.checks instanceof Array ? userObject.checks : []

                            let checkPosition = userChecks.indexOf(id)
                            if(checkPosition > -1){
                                userChecks.splice(checkPosition,1)

                                userObject.checks=userChecks
                                data.update('users',userObject.phone,userObject,(err3)=>{
                                    if(!err3){
                                        callBack(200)
                                    }else{
                                        callBack(500,{
                                            error:'error in server side'
                                        })
                                    }
                                })
                            }else{
                                callBack(500,{
                                    error:'The id your are trying to delete is not present'
                                })
                            }
                        }else{
                            callBack(500,{
                                error:'error in server side'
                            })
                        }
                    })
                }else{
                    callBack(500,{
                        error:'error in server side'
                    })
                }
              })
            } else {
              callBack(404, {
                error: "Authorization error",
              });
            }
          }
        );
      } else {
        callBack(404, {
          error: "error in request2",
        });
      }
    });
  } else {
    callBack(404, {
      error: "error in request",
    });
  }
};

module.exports = handler;

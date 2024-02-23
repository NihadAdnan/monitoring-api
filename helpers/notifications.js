const https = require("https");
const { twilio } = require("./environments");
const querystring = require("querystring");

const notifications = {};

// Twilio recovery code : VYYLYXM29DHRWDU8BZNUE258
// Account SID : AC5e58a749e05dc2042f24160fd50e89d6
// Auth token : e0140dfc45a997a633b10b9786eef40a
// phone number : +15169630930

notifications.sendTwilioSms = (phone, msg, callBack) => {
  const userPhone =
    typeof phone === "string" && phone.trim().length === 11
      ? phone.trim()
      : false;

  const userMsg =
    typeof msg === "string" &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (userMsg && userPhone) {
    const payload = {
      From: twilio.fromPhone,
      To: `+88${userPhone}`,
      Body: userMsg,
    };
    const stringifyPayload = querystring.stringify(payload);

    const reqDetails = {
      hostname: "api.twilio.com",
      method: "GET",
      path:`https://api.twilio.com/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-from-urlencoded",
      },
    };

    const req = https.request(reqDetails, (res) => {
      const status = res.statusCode;
      if (status === 200 || status === 201) {
        callBack(false);
      } else {
        callBack(`Status code that returned was ${status}`);
      }
    });

    req.on("error", (e) => {
      callBack(e);
    });

    req.write(stringifyPayload);
    req.end();
  } else {
    callBack("Parameters invalid!");
  }
};

module.exports = notifications;

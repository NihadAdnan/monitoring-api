//module scaffolding
const environments = {};

environments.staging = {
  port: 3000,
  envName: "staging",
  maxCheck:5,
  twilio:{
    fromPhone:'+15169630930',
    accountSid:  'AC5e58a749e05dc2042f24160fd50e89d6',
    authToken:'e0140dfc45a997a633b10b9786eef40a'

  }
};

environments.production = {
  port: 5000,
  envName: "production",
  maxCheck:5,
  twilio:{
    fromPhone:'+15169630930',
    accountSid:  'AC5e58a749e05dc2042f24160fd50e89d6',
    authToken:'e0140dfc45a997a633b10b9786eef40a'

  }
};

//detarmining environment
const currentEnvironment =
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

const environmentExport =
  typeof(environments[currentEnvironment]) === "object"  ? environments[currentEnvironment]
    : environments.staging;

//exporting
module.exports = environmentExport;

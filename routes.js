

//dependencies
const {sampleHandler} = require('./handlers/routeHandlers/sampleHandler')
const {userHandler} = require('./handlers/routeHandlers/userHandler')
const {tokenHandler} = require('./handlers/routeHandlers/tokenHandler')
const {checkHandler} = require('./handlers/routeHandlers/checkHandler')

//module scaffolding 
const routes = {
    sample: sampleHandler,
    user: userHandler,
    token:tokenHandler,
    checks:checkHandler,
}

module.exports = routes
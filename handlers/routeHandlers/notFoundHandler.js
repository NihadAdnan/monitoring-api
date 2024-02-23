//module scaffolding
const handler = {};

handler.notFoundHandler=(reqProperties,callBack)=>{
    callBack(404,{
        message: 'Sorry your url is not found!'
    })
}

module.exports = handler
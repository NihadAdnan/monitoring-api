
const data = require('../../lib/data')
const {hash, randomString} = require('../../helpers/utilities')
const {parseJson} = require('../../helpers/utilities')

//module scaffolding
const handler = {};

handler.tokenHandler = (reqProperties,callBack) => {
    const acceptedMethods = ['get','post','put','delete']
    if(acceptedMethods.indexOf(reqProperties.method)>-1){
        handler._tokens[reqProperties.method](reqProperties,callBack);
    }else{
        callBack(405)
    }
};

handler._tokens = {}

handler._tokens.post=(reqProperties,callBack)=>{
    const password = typeof(reqProperties.body.password) === 'string' && reqProperties.body.password.trim().length > 0 ? reqProperties.body.password : false
    const phone = typeof(reqProperties.body.phone) === 'string' && reqProperties.body.phone.trim().length === 11 ? reqProperties.body.phone : false

    if(phone && password){
        data.read('users',phone,(err,uData)=>{
            const userData = {...parseJson(uData)}
            let hashedPassword=hash(password)
            if(hashedPassword === userData.password){
                let tokenID = randomString(20);
                let expires = Date.now() + 60*60*1000
                let tokenObject = {
                    phone,
                    'id':tokenID,
                    expires
                }
                data.create('tokens',tokenID,tokenObject,(err)=>{
                    if(!err){
                        callBack(200,tokenObject)
                    }else{
                        callBack(400,{
                            error:'error in server'
                        })
                    }
                })

            }else{
                callBack(400,{
                    error:'error in server'
                })
            }
        })
    }else{
        callBack(404,{
            error:'error in request'
        })
    }
}
handler._tokens.put=(reqProperties,callBack)=>{

    const id = typeof(reqProperties.body.id) === 'string' && reqProperties.body.id.trim().length === 20 ? reqProperties.body.id : false

    const extend = typeof(reqProperties.body.extend) === 'boolean' && reqProperties.body.extend === true ? true : false


    if(id && extend){
        data.read('tokens',id,(err,tokenData)=>{
            const tokenObject = parseJson(tokenData)
            if(tokenObject.expires > Date.now()){
                tokenObject.expires = Date.now() + 60*60*1000

                data.update('tokens',id,tokenObject,(err2)=>{
                    if(!err2){
                        callBack(200)
                    }else{
                        callBack(500,{
                            error:'server error'
                        })
                    }
                })

            }else{
                callBack(400,{
                    error:'Already expired'
                })
            }
        })
    }
    else{
        callBack(400,{
            error:'error in request'
        })
    }

}
handler._tokens.get=(reqProperties,callBack)=>{
    const id = typeof(reqProperties.queryObject.id) === 'string' && reqProperties.queryObject.id.trim().length === 20 ? reqProperties.queryObject.id : false

    if(id){
        data.read('tokens',id,(err,tokenData)=>{
            const token = {...parseJson(tokenData)}
            if(!err && token){
                callBack(200,token)
            }else{
                callBack(404,{
                    error:'token not found'
                })
            }
        })
    }else{
        callBack(404,{
            error:'id not found'
        })
    }

}
handler._tokens.delete=(reqProperties,callBack)=>{
    const id = typeof(reqProperties.queryObject.id) === 'string' && reqProperties.queryObject.id.trim().length === 20 ? reqProperties.queryObject.id : false

    if(id){
        data.read('tokens',id,(err,tokenData)=>{
            if(!err && tokenData){
                data.delete('tokens',id,(err2)=>{
                    if(!err2){
                        callBack(200,{
                            message:'Token deleted successfully!'
                        })
                    }else{
                        callBack(500,{
                            message:'Error in sever'
                        })
                    }
                })
            }
            else{
                callBack(500,{
                    error:'error in server side'
                })
            }
        })
    }
    else{
        callBack(404,{
            error:'Error in request'
        })
    }
    
}

handler._tokens.verify=(id,phone,callBack)=>{
    data.read('tokens',id,(err,tokenData)=>{
        if(!err && tokenData){
            if(parseJson(tokenData).phone === phone && parseJson(tokenData).expires > Date.now()){
                callBack(true)
            }
            else{
                callBack(false)
            }
        }else{
            callBack(false)
        }
    })
}


module.exports = handler;


const data = require('../../lib/data')
const {hash} = require('../../helpers/utilities')
const {parseJson} = require('../../helpers/utilities')
const tokenHandler = require('./tokenHandler')

//module scaffolding
const handler = {};

handler.userHandler = (reqProperties,callBack) => {
    const acceptedMethods = ['get','post','put','delete']
    if(acceptedMethods.indexOf(reqProperties.method)>-1){
        handler._users[reqProperties.method](reqProperties,callBack);
    }else{
        callBack(405)
    }
};

handler._users = {}

handler._users.post=(reqProperties,callBack)=>{
    const firstName = typeof(reqProperties.body.firstName) === 'string' && reqProperties.body.firstName.trim().length > 0 ? reqProperties.body.firstName : false
    const lastName = typeof(reqProperties.body.lastName) === 'string' && reqProperties.body.lastName.trim().length > 0 ? reqProperties.body.lastName : false
    const password = typeof(reqProperties.body.password) === 'string' && reqProperties.body.password.trim().length > 0 ? reqProperties.body.password : false
    const phone = typeof(reqProperties.body.phone) === 'string' && reqProperties.body.phone.trim().length === 11 ? reqProperties.body.phone : false
    const tosAg = typeof(reqProperties.body.tosAg) === 'boolean' ? reqProperties.body.tosAg : false;


    if(firstName && lastName && password && phone && tosAg){
        data.read('users',phone,(err)=>{
            if(err){
                const userObjects = {
                    firstName,
                    lastName,
                    phone,
                    tosAg,
                    password:hash(password)
                }
                data.create('users',phone,userObjects,(err)=>{
                    if(!err){
                        callBack(200,{
                            message:'user created successfully!'
                        })
                    }else{
                        callBack(500,{
                            error:'could not create user'
                        })
                    }
                })
            }else{
                callBack(500,{
                    error:'problem in server side'
                })
            }
        })
    }else{
        callBack(400,{
            error:'problem in request'
        })
    }
}
handler._users.put=(reqProperties,callBack)=>{
    const phone = typeof(reqProperties.body.phone) === 'string' && reqProperties.body.phone.trim().length === 11 ? reqProperties.body.phone : false


    const firstName = typeof(reqProperties.body.firstName) === 'string' && reqProperties.body.firstName.trim().length > 0 ? reqProperties.body.firstName : false
    const lastName = typeof(reqProperties.body.lastName) === 'string' && reqProperties.body.lastName.trim().length > 0 ? reqProperties.body.lastName : false
    const password = typeof(reqProperties.body.password) === 'string' && reqProperties.body.password.trim().length > 0 ? reqProperties.body.password : false

    if(phone){
        if(firstName || lastName || password){

            let token = typeof(reqProperties.headers.token)==='string' ? reqProperties.headers.token : false
        
            tokenHandler._tokens.verify(token,phone,(tokenID)=>{
                if(tokenID){
                    data.read('users',phone,(err,uData)=>{
                        const userData = {...parseJson(uData)}
                        if(!err && userData){
                            if(firstName){
                                userData.firstName=firstName
                            }
                            if(lastName){
                                userData.lastName=lastName
                            }
                            if(password){
                                userData.password=hash(password)
                            }
                            data.update('users',phone,userData,(err2)=>{
                                if(!err2){
                                    callBack(200,{
                                        message:'user updated successfully'
                                    })
                                }
                                else{
                                    callBack(500,{
                                        error:'problem in server'
                                    })
                                }
                            })
                        }
                        else{400,{
                            error:'problem in request'
                        }}
                    })
                }
                else{
                    callBack(403,{
                        error:'Authorization failed'
                    })
                }
            })

        }else{
            callBack(400,{
                error:'problem in request'
            })
        }
    }else{
        callBack(404,{
            error:'user not found!'
        })
    }
}
handler._users.get=(reqProperties,callBack)=>{
    const phone = typeof(reqProperties.queryObject.phone) === 'string' && reqProperties.queryObject.phone.trim().length === 11 ? reqProperties.queryObject.phone : false

    if(phone){
        let token = typeof(reqProperties.headers.token)==='string' ? reqProperties.headers.token : false
        
        tokenHandler._tokens.verify(token,phone,(tokenID)=>{
            if(tokenID){
                data.read('users',phone,(err,u)=>{
                    const user = {...parseJson(u)}
                    if(!err && user){
                        delete user.password
                        callBack(200,user)
                    }else{
                        callBack(404,{
                            error:'user not found'
                        })
                    }
                })
            }
            else{
                callBack(403,{
                    error:'Authorization failed'
                })
            }
        })

    }else{
        callBack(404,{
            error:'user not found'
        })
    }

}
handler._users.delete=(reqProperties,callBack)=>{
    const phone = typeof(reqProperties.queryObject.phone) === 'string' && reqProperties.queryObject.phone.trim().length === 11 ? reqProperties.queryObject.phone : false

    if(phone){

        let token = typeof(reqProperties.headers.token)==='string' ? reqProperties.headers.token : false
        
        tokenHandler._tokens.verify(token,phone,(tokenID)=>{
            if(tokenID){
                data.read('users',phone,(err,userData)=>{
                    if(!err && userData){
                        data.delete('users',phone,(err2)=>{
                            if(!err2){
                                callBack(200,{
                                    message:'User deleted successfully!'
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
                callBack(403,{
                    error:'Authorization failed'
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

module.exports = handler;




const utilities = {}
const crypto = require('crypto')


utilities.parseJson=(stringJson)=>{

    let output;
    try {
        output = JSON.parse(stringJson)
    } catch (error) {
        output = {};
    }
    return output;
}


utilities.hash=(str)=>{
    if(typeof str === 'string' && str.length > 0){
        const hash = crypto.createHmac('sha256','kokokokkokokokok').update(str).digest('hex')
        return hash
    }else{
        return false
    }
}


utilities.randomString=(strlength)=>{
    let length = strlength;
    length = typeof strlength === 'number' && strlength > 0 ? strlength : false

    if(length){
        const possibleCharac = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let output = '';
        for(let i = 0; i < length ; i++){
            const randomCharac = possibleCharac.charAt(Math.floor(Math.random()*possibleCharac.length))
            output +=randomCharac
        }
        return output
    }
    return false
}



module.exports = utilities
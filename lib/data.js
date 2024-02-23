


const fs = require('fs')
const path = require('path')

const lib = {};


lib.basedir = path.join(__dirname,'/../.data/')

//creating file
lib.create =(dir,file,data,callback)=>{
    fs.open(`${lib.basedir+dir}/${file}.json`,'wx',(err,fileDescriptor)=>{
        if(!err && fileDescriptor){
            const stringData = JSON.stringify(data)
            fs.writeFile(fileDescriptor,stringData,(err2)=>{
                if(!err2){
                    fs.close(fileDescriptor,(err3)=>{
                        if(!err3){
                            callback(false)
                        }else{
                            callback('Error closing the file')
                        }
                    })

                }else{
                    callback('Error in writing file')
                }
            })
        }else{
            callback('Error in creating file')
        }
    })
}

//reading file
lib.read=(dir,file,callback)=>{
    fs.readFile(`${lib.basedir+dir}/${file}.json`,'utf-8',(err,data)=>{
        callback(err,data)
    })
}

lib.update=(dir,file,data,callback)=>{
    fs.open(`${lib.basedir+dir}/${file}.json`,'r+',(err,fileDescriptor)=>{
        if(!err && fileDescriptor){
            const stringData = JSON.stringify(data)

            fs.ftruncate(fileDescriptor,(err2)=>{
                if(!err2){
                    fs.writeFile(fileDescriptor,stringData,(err3)=>{
                        if(!err3){
                            fs.close(fileDescriptor,(err4)=>{
                                if(!err4){
                                    callback(false)
                                }else{
                                    callback('error in closing file')
                                }
                            })
                        }else{
                            callback('error in writing in file')
                        }
                    })
                }else{
                    callback('error in truncating file')
                }
            })
        }else{
            callback('Error in updating file')
        }
    })
}

lib.delete=(dir,file,callback)=>{
    fs.unlink(`${lib.basedir+dir}/${file}.json`,(err)=>{
        if(!err){
            callback(false)
        }else{
            callback('Error in deleting file')
        }
    })
}

module.exports=lib
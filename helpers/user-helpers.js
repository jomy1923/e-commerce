var db=require('../config/connection')
var collection=require('../config/collection')
var objectId=require('mongodb').ObjectID
const { response } = require('express')
const bcrypt= require('bcrypt')
module.exports={
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection(collection.USER_COLLECTION).find({role:1}).toArray()
            console.log(users);
            resolve(users)

        })   
    },
    getUserDetails:(userId)=>{
        return new Promise((resolve,reject)=>{
           db.get().collection(collection.USER_COLLECTION).findOne({_id:objectId(userId)}).then((users)=>{
              
               resolve(users)
           })
        })
    },
    updateUser:(userId,data)=>{
        console.log(data,userId);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},{
                $set:{
                    uname:data.uname,
                    email:data.email,
                    phNo:data.phNo
                }
            }).then((response)=>{
                resolve(response)
                console.log(response,'jomy');
            })
        })
    },
    blockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
            {
                $set:{
                    block:true
                }
            }).then((result)=>{
                resolve(result)
            })
        })
    },
    unblockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userId)},
            {
                $set:{
                    block:false
                }
            }).then((result)=>{
                resolve(result)
            })
        })
    },
    idExists:(uname)=>{
        return new Promise(async(resolve,reject)=>{
            let username=await db.get().collection(collection.USER_COLLECTION).findOne({uname:uname})
            if(username){
                resolve()
            }else{
                reject()
            }

        })
    },
    
    createUser:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.password=await bcrypt.hash(userData.password,10)
            userData.role=1

            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                if(data){
                console.log(data.ops[0])
                resolve(data.ops[0])
            }
                else{
                    reject()
                }
            })

        })
    }
}
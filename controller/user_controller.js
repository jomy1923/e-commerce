var db = require('../config/connection')
var collection= require('../config/collection')
const bcrypt= require('bcrypt')
var objectId=require('mongodb').ObjectID
const { response } = require('express')
module.exports={
    login:(userData)=>{
        return new  Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({uname:userData.uname})
            
            if(user){
                
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        console.log('login failed')
                        reject({status:false})
                    }
                })  
            }else{
                console.log('login failed')
                reject({status:false})


            }
            
        })
    },
    register:(userData)=>{
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
    addToCart:(proId,userId)=>{
        let proObj={
            item:objectId(proId),
            quantity:1
        }
        console.log(proObj);
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(userCart){
                let proExist=userCart.products.findIndex(product=>product.item==proId)
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:objectId(userId),'products.item':objectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()

                    })
                }else{

                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
                {
                    $push:{products:proObj}
                }
                ).then((response)=>{
                    resolve()
                })
            }

            }else{
                let cartObj={
                    user:objectId(userId),
                    products:[proObj]

                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })

            }
        })
    },
    getCartProducts:(userId)=>{
        console.log(userId+'user');
        return new Promise(async(resolve,reject)=>{
        let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:objectId(userId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            }
            
        ]).toArray()
        
        resolve(cartItems)
        })
    },

    getCartCount:(userId)=>{
        
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count=cart.products.length
                
            }
            resolve(count)
        })

    }
   
}
var db=require('../config/connection')
var collection=require('../config/collection')
var objectId=require('mongodb').ObjectID
const { response } = require('express')
const bcrypt= require('bcrypt')
const moment=require('moment')
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
        console.log(userId,'the user id');
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
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let allOrders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(allOrders)
        })
    },
    shipOrder: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    ship: 'Order Dispatched',
                }
            }).then((response) => {
                console.log(response,'resposne');

                resolve()
            })
        })
    },
    cancelOrder: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(id) }, {
                $set: {
                    ship: 'Order Cancelled',
                }
            }).then(() => {
                resolve()
            })

        })
    },
    getAllCoupons:()=>{
        return new Promise(async(resolve,reject)=>{
            let coupons= await db.get().collection(collection.COUPON_COLLECTION).find().toArray()

            resolve(coupons)
        })
    },
    saveCoupon:(coupon,date)=>{
        console.log('date',date,'coupon',coupon);
        let startDate=moment(date.startDate).format('L')
        let endDate=moment(date.endDate).format('L')
        let offer=parseInt(date.offer)
        console.log('kundannn');
        console.log('result',startDate,endDate,offer);
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).insertOne({
                from:startDate,
                to:endDate,
                offer:offer,
                coupon:coupon
            }).then(()=>{
                resolve()
            })
        })
    },
    deleteCoupon:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION).removeOne({_id:objectId(proId)})

            resolve()
        })
    },
    couponCheck:(code)=>{
        return new Promise(async(resolve,reject)=>{
            console.log('code',code);
            let currentDate=moment(new Date).format('L')
            let coupon=await db.get().collection(collection.COUPON_COLLECTION).findOne({coupon:code.coupon})
            console.log('coupon',coupon)
            if(coupon){
                let dateFrom=Date.parse(coupon.from)
                let dateTo=Date.parse(coupon.to)
                let checkDate=Date.parse(currentDate)
                
                if(dateFrom >= checkDate && checkDate <= dateTo){
                    resolve(coupon)
                }else{
                    reject()
                }
                
            }else{
                reject()
            }
        })
    },
    
}
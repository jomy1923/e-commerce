var db = require('../config/connection')
var collection= require('../config/collection')
const bcrypt= require('bcrypt')
const moment=require('moment')
var objectId=require('mongodb').ObjectID
const Razorpay=require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_sYLfBPYn9nZLZi',
    key_secret: 'FoDsuhllphV79mF9PhJXTRDB',
  });
const { response } = require('express')
const { promises } = require('fs')
const { resolve } = require('path')
module.exports={
    login:(userData)=>{
        return new  Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({uname:userData.uname})
            console.log(user,'user is');

            if(user){
                if(user.block){
                    console.log('user blocked');
                    response.block=true
                    reject(response)
                }else{
                    bcrypt.compare(userData.password,user.password).then((status)=>{
                        if(status){
                            
                            response.user=user
                            response.status=true
                            console.log(response,'after user is response');
                            resolve(response)
                        }else{
                            console.log('login failed')
                            response.invalidUserUser=true
                            reject(response)
                        }
                    }) 
                }
                
                
            }else{
                console.log('login failed')
                response.invalidUser=true
                            reject(response)


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
        console.log(userId+    'get cart products');
        return new Promise(async(resolve,reject)=>{

            let userCart= await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})  
            if(userCart){
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
            },
            {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]},
                    singleTotal:{$multiply:[{$arrayElemAt:['$product.Price',0]},'$quantity']}

                   
                }
            }
            
        ]).toArray()
        
      
        console.log('ajaml',cartItems);
        resolve(cartItems)
    }else{
        reject(response)
    }
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

    },
    ChangeProductQuantity:(details)=>{
        count=parseInt(details.count)
        quantity=parseInt(details.quantity)
        
        return new Promise((resolve,reject)=>{
            if(count==-1 && quantity==1){
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart)},
            {
                $pull:{products:{item:objectId(details.product)}}
            }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
        }else{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
            {
                $inc:{'products.$.quantity':count}
            }
            ).then((response)=>{
                resolve({status:true})

            })
        }
            
            
        })
    },

    DeleteProduct:(details)=>{
        
        return new Promise((resolve,reject)=>{
           
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart)},
            {
                $pull:{products:{item:objectId(details.product)}}
            }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
       
            
            
        })
    },
    getTotalAmount:(userId)=>{
        
        return new Promise(async(resolve,reject)=>{

            let userCart= await  db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})  
            
        let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
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
            },
            {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                   
                }
            },
            {
                $group:{
                    _id:null,
                    total:{$sum:{$multiply:['$quantity','$product.Price']}}
                }
            }
            
            
        ]).toArray()
        console.log('eueoiuoy',total);
        if(total.length>0){
            resolve(total[0].total)
        }else{
            total=0
            resolve(total)
        }
      
        
        
       })

    },
    placerOrder:(order,products,total)=>{
        return new Promise((resolve,reject)=>{
            
            let status=order['payment-method']==='COD'?'placed':'pending'
            let orderObj={
                deliveryDetails:{
                    firstName:order['form-first-name'],
                    lastName:order['form-last-name'],
                    companyName:order['form-company-name'],
                    country:order['form-country'],
                    state:order['form-state'],
                    mobile:order['form-phone'],
                    address:order['form-address-1'],
                    pincode:order['form-zipcode'],
                    email:order['form-email']
                    


                },
                userId:objectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                getTotalAmount:total,
                status:status,
                date:moment(new Date).format('L'),
                ship:"Not Dispatched"

            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).removeOne({user:objectId(order.userId)})
                resolve(response.ops[0]._id)
            })
            

        })

    },
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            console.log(cart);
            resolve(cart.products)
        })
    },
    getUserOrder:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userId:objectId(userId)}).toArray()
            resolve(orders)

        })
    },
    getOrderProducts:(orderId)=>{
        console.log('orderId in get view order',orderId);
        
        return new Promise(async(resolve,reject)=>{
                let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match:{_id:objectId(orderId)}
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
                    },
                    {
                        $project:{
                            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                           
                        }
                    }
                    
                ]).toArray()
              
                
                resolve( orderItems)
                console.log('ordred products',orderItems);
               
            
        })
    },
    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
            var options = {
                amount: total*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt:""+ orderId
              };
              instance.orders.create(options, function(err, order) {
                  if(err){
                      console.log(err);
                  }else{
                    console.log("new order:",order);
                    resolve(order)
                  }
               
              });   
        })
    },
    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'FoDsuhllphV79mF9PhJXTRDB');
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
            hmac=hmac.digest('hex')
            if(hmac==details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }
        })
    },
    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
            {
                $set:{
                    status:'placed'
                }
            }
            ).then(()=>{
                resolve()
            })
        })
    },
    otpUserCheck: (userData)=>{

        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phNo: userData.mobile })

            if (user) {
                console.log("success phn number verified");
                resolve()
               
            } else {
                reject()
            }
        })
    },
    otpLogin:(userData)=> {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ phNo: userData.mobile })
            resolve(user)


        })
    },
    getSingeTotal: (userId, proId) => {
       
        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }

                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',

                    }
                },
                {
                    $match: { item: objectId(proId) }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product',
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }

                    }
                },
                {
                    $project: {
                        _id:null,
                        singleTotal:{ $multiply: ['$quantity', '$product.Price']}
                       
                }
            }


            ]).toArray()
          
           if(total.length>0){
            resolve(total[0].singleTotal)
           }else{
               total=0;
               resolve(total)
           }

          



        })

    },
    deleteCart: function (details) {
        console.log('details',details);

        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).removeOne({ user: objectId(details.user)}).then((response) => {
                resolve(true)
            })
        })
    },
    addAddress: (details) => {
        console.log('address in user',details);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).insertOne({
                user: objectId(details.user),
                firstName:details['form-first-name'],
                lastName:details['form-last-name'],
                country:details['form-country'],
                state:details['form-state'],
                mobile:details['form-phone'],
                address:details['form-address-1'],
                pincode:details['form-zipcode'],
                email:details['form-email']
            })
            resolve()
        })
    },
    getAllAddress:(userId)=>{
        console.log('userId',userId);
        return new Promise(async(resolve,reject)=>{
            let address=await db.get().collection(collection.ADDRESS_COLLECTION).find({user:objectId(userId)}).toArray()
            console.log('address in usercon',address);
            if(address.length>0){
                resolve(address)
            }else{
                reject()
            }
                
            
        })
    },
    getMyAddress:(id)=>{
        console.log('id in user controller',id);
        return new Promise(async(resolve,reject)=>{
            let myAddress= await db.get().collection(collection.ADDRESS_COLLECTION).find({user:objectId(id)}).toArray()
     console.log('my address',myAddress);
     if(myAddress.length>0)
     {
        resolve(myAddress)
     }else{
         reject()
     }
     
        })
     
    },
    editAddress:(details)=>{
        console.log('to be edited',details);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ADDRESS_COLLECTION).updateOne({user:objectId(details.user)},
            {
                $set:{
                    user: objectId(details.user),
                    firstName:details['form-first-name'],
                    lastName:details['form-last-name'],
                    country:details['form-country'],
                    state:details['form-state'],
                    mobile:details['form-phone'],
                    address:details['form-address-1'],
                    pincode:details['form-zipcode'],
                    email:details['form-email']
                }
            })
            console.log('address');
           resolve()
        })
    }
}
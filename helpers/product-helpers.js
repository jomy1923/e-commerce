var db=require('../config/connection')
var collection=require('../config/collection')
var objectId=require('mongodb').ObjectID
module.exports={

    addProduct: (product,callback)=>{

        product.Price=parseInt(product.Price)
        db.get().collection('products').insertOne(product).then((data)=>{
            callback(data.ops[0]._id)
        })
    },
    getAllproducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)

        })   
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(proId) }).then((response)=>{
              
                resolve(response)
            })
        })
        
    },

 getProductDetails:(proId)=>{
     return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
           
            resolve(product)
        })
     })
 },
 updateProduct:(proId,proDetails)=>{
     return new Promise((resolve,reject)=>{
         db.get().collection(collection.PRODUCT_COLLECTION)
         .updateOne({_id:objectId(proId)},{
             $set:{
                 Name:proDetails.Name,
                 Price:proDetails.Price,
                 Description:proDetails.Description,
                 Category:proDetails.Category,
                 

             }
         }).then((response)=>{
             resolve()
         })
     })
 }
}
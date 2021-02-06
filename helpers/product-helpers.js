var db=require('../config/connection')
var collection=require('../config/collection')
var objectId=require('mongodb').ObjectID
module.exports={

    addProduct: (product,callback)=>{
        console.log(product)

        product.Price=parseInt(product.Price)
        product.Quantity=parseInt( product.Quantity)
        db.get().collection('products').insertOne(product).then((data)=>{
            callback(data.ops[0]._id)
        })
    },
    getAllproducts:()=>{
        
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            console.log(products);
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
    console.log(proDetails,'product in edit');
    proDetails.Price=parseInt(proDetails.Price)
    proDetails.Quantity=parseInt(proDetails.Quantity)
     return new Promise((resolve,reject)=>{
         db.get().collection(collection.PRODUCT_COLLECTION)
         .updateOne({_id:objectId(proId)},{
             $set:{
                 Name:proDetails.Name,
                 Price:proDetails.Price,
                 category:proDetails.category,
                 Quantity:proDetails.Quantity,
                 Description:proDetails.Description,
                 
                
             }
             
         }).then((response)=>{
             console.log(response,'response after updation');
             resolve()
         })
     })
 },
 showCategory:function(){
    return new Promise(async(resolve,reject)=>{
        let category= await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
        resolve(category)
    })
},
insertCategory:function (data){
    return new Promise(async(resolve,reject)=>{
        let category= await db.get().collection(collection.CATEGORY_COLLECTION).findOne({productCategory:data.productCategory})
        if(category){
            reject()
        }else{
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne({productCategory:data.productCategory})
            resolve()
        }
    })
}, 
showOneCategory:function(proId){
    return new Promise(async(resolve,reject)=>{
        category=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(proId)})

        resolve(category)
    })
},
updateCategory:function(proId,proCategory){
        
    return new Promise(async(resolve,reject)=>{
        category=await db.get().collection(collection.CATEGORY_COLLECTION).findOne({productCategory:proCategory})
        if(category){
            reject()
        }else{
            
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    productCategory:proCategory
                }
            }).then((response)=>{
                resolve()
            })
            
        }
    })
},
deleteCategory:function(proId){
    return new Promise(async(resolve,reject)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).removeOne({_id:objectId(proId)})
        resolve()
    })
}
}
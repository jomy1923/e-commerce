var db=require('../config/connection')
var collection=require('../config/collection')
var objectId=require('mongodb').ObjectID
const moment=require('moment')
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
},
viewOneProduct: function (proId) {
    return new Promise(async (resolve, reject) => {
        let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
        resolve(product)
    })
},
showCategory: function () {
    return new Promise(async (resolve, reject) => {
        let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
        resolve(category)
    })
},
showOneCategory: function (proId) {
    return new Promise(async (resolve, reject) => {
        category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id:objectId(proId) })

        resolve(category)
    })
},
updateOffer: (proId, data) => {
    console.log('dataupdate offer ', data)
    offer = parseInt(data.offer)
    price = parseInt(data.productPrice)
    console.log('parseInt',offer,price);
    offerPrice =parseInt(price - ((price * offer) / 100))
    console.log('offer', offerPrice);
    return new Promise(async (resolve, reject) => {
        let product = await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
            $set: {
                offer: offer,
                Price: offerPrice,
                oldPrice: price,
                startDate:moment(data.startDate).format('L'),
                endDate:moment(data.endDate).format('L')
            }
        })
        resolve()
    })
},
removeOffer: (proId) => {
    return new Promise(async (resolve, reject) => {
        let oldPrice = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
        console.log('oldprice', oldPrice.oldPrice);
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
            $set: {
                productPrice: oldPrice.oldPrice
            },
            $unset: {
                oldPrice: 1,
                offer: 1,
                startDate:1 ,
                endDate:1

            }
        }).then((response) => {
            resolve()
        })
    })

},
updateCategoryOffer: (proId, offer) => {
    return new Promise(async (resolve, reject) => {
        let operations
        let offerPer=parseInt(offer.offer)
        console.log('offerPer',offerPer);
        let startDate=moment(offer.startDate).format('L')
        let endDate=moment(offer.endDate).format('L')
        
        console.log('date for storing',startDate,endDate);
        console.log('all data ', proId, 'offer', offer)
        let allCategoryOffers = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
            {
                $match: { category: offer.productName, offer: { $exists: true } }
            },
            {
                $set: {
                    Price: '$oldPrice'
                }
            },
            {
                $unset: ['offer', 'oldPrice']
            }
        ]).toArray()
        console.log('allCate', allCategoryOffers);
        console.log('length',allCategoryOffers.length)
        if (allCategoryOffers.length > 0) {

            for (i = 0; i < allCategoryOffers.length; i++) {
                console.log('data,',allCategoryOffers[i].Price);
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(allCategoryOffers[i]._id) }, {
                    $set: {
                        Price: allCategoryOffers[i].Price,


                    },
                    $unset: {
                        oldPrice: 1,
                        offer: 1,
                        startDate:1,
                        endDate:1
                    }
                })
            }
           

        } 
        let Allproducts=await db.get().collection(collection.PRODUCT_COLLECTION).find({category:offer.productName}).toArray()
        console.log('existing products',Allproducts);
        for(i=0;i<Allproducts.length;i++){
            console.log(Allproducts.length);
            
            operations=parseInt((Allproducts[i].Price)-((Allproducts[i].Price*offerPer)/100))
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(Allproducts[i]._id)},{
                $set:{
                    Price:operations,
                    oldPrice:Allproducts[i].Price,
                    offer:offerPer,
                    startDate:startDate,
                    endDate:endDate

                }
            })
        }
        db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(proId)},{
            $set:{
                offer:offerPer,
                startDate:startDate,
                endDate:endDate
            }
        })


        resolve()

    })
},
removeCategoryOffer:(name)=>{
    console.log('name',name)
    return new Promise(async(resolve,reject)=>{
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
            {
                $match:{category:name,offer:{$exists:true}}
            },
            {
                $set: {
                    Price: '$oldPrice'
                }
            },
            {
                $unset: ['offer', 'oldPrice']
            }




        ]).toArray()
        console.log('produts here',products)
        products.forEach(element => {
            console.log('for each',element.productName);
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(element._id)},
            {
                $set:{
                    Price:element.Price,

                },
                $unset:{
                    offer:1,
                    oldPrice:1,
                    endDate:1,
                    startDate:1
                }
            })
        });
        db.get().collection(collection.CATEGORY_COLLECTION).updateOne({productCategory:name},
            {
                $unset:{
                    offer:1,
                    endDate:1,
                    startDate:1
                }
            }).then(()=>{
                resolve()
            })
        
    })
}


}
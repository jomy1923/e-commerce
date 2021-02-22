var express = require('express');
const user_controller = require('../controller/user_controller');
var router = express.Router();
const productHelpers=require('../helpers/product-helpers')
var voucher_codes = require('voucher-code-generator');
const userHelpers=require('../helpers/user-helpers')
const orderHelpers=require('../helpers/order-helpers')

const userController=require('../controller/user_controller')
const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
     res.redirect('/login')
  }
}


/* GET home page. */
router.get('/admin', function(req, res) {
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
      req.session.loggedIn=true
      orderHelpers.getTotalOrderNum().then((orderNum) => {
     res.render('admin/home',{admin:true,userName:user,roles:role,orderNum})
    })
    }else{
      res.redirect('/login') 
  }
  }
 
});

router.get('/all-products',verifyLogin,(req,res)=>{
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
      productHelpers.getAllproducts().then(async(products)=>{
        let category=await productHelpers.showCategory(req.params.id)
        console.log(category,'view products');
    res.render('admin/view-products',{admin:true,products,category,userName:user,roles:role})
  
        
        })
    }else{
      res.redirect('/login') 
  }
  }
 

})

router.get('/add-product',verifyLogin,function(req,res){
productHelpers.showCategory().then((category)=>{
  res.render('admin/add-product',{admin:true,category})
})

  
})

router.post('/add-product',(req,res)=>{
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.Image
    
   image.mv('./public/img/product-images/'+id+'.jpg',(err)=>{
     if(!err){
      res.redirect('/add-product')
     }else{
       console.log(err)
     }
   })
   
  }) }else{
    res.redirect('/login') 
}
}
  })
  router.get('/admin/delete-product/:id',verifyLogin,(req,res)=>{
    let proId=req.params.id
   
    productHelpers.deleteProduct(proId).then((response)=>{
      res.redirect('/all-products')
    })
  })
  
router.get('/admin/edit-product/:id',verifyLogin,async(req,res)=>{
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){

  let product=await productHelpers.getProductDetails(req.params.id)
  let category=await productHelpers.showCategory(req.params.id)
 
  res.render('admin/edit-product',{product,category})
}else{
  res.redirect('/login') 
}
}
})

router.post('/edit-product/:id',(req,res)=>{
  
  let id=req.params.id
 console.log(id,'edit on admin');
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/all-products')
    if(req.files.Image){
      console.log(req.files.Image+'image');
      
      let image=req.files.Image
      
      image.mv('./public/img/product-images/'+id+'.jpg',(err)=>{
        if(!err){
         res.render('admin/edit-product')
        }else{
          console.log(err)
        }
      })
    }
  })
  
})
router.get('/users',verifyLogin,(req,res)=>{
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
      userHelpers.getAllUsers().then((users)=>{
        console.log(users);
        res.render('admin/view-users',{admin:true,users,userName:users,roles:role})
        })
    }else{
      res.redirect('/login') 
  }
  }
 
})
router.get('/edit-users/:id',async(req,res)=>{
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){

  let users=await userHelpers.getUserDetails(req.params.id)
 
  res.render('admin/edit-users',{users,admin:true,users,userName:users,roles:role})
}else{
  res.redirect('/login') 
}
}
})
router.post('/edit-users/:id',(req,res)=>{
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
userHelpers.updateUser(req.params.id,req.body).then(()=>{
  res.redirect('/users')
})
}else{
  res.redirect('/login') 
}
}
})
router.get('/block-users/:id',(req,res)=>{
 
  console.log('entered');
  
  let user=req.session.name
  let role=req.session.role
  if (user){
    
    if(role===0){
     
  let userId=req.params.id
  console.log('usrid is',userId)
  userHelpers.blockUser(userId).then((data)=>{
    res.redirect('/login')
  })
}else{
  res.redirect('/login') 
}
}
})
router.get('/unblock-users/:id',(req,res)=>{
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
  let userId=req.params.id
  userHelpers.unblockUser(userId).then((data)=>{
    res.redirect('/users')
  })
}else{
  res.redirect('/login') 
}
}
})
router.get('/create-users',(req,res)=>{
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
  res.render('admin/create-user',{admin:true})
}else{
  res.redirect('/login') 
}
}
})
router.post('/create-users',(req,res)=>{
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
      userHelpers.idExists(req.body.uname).then((data)=>{
      
        res.json({user:false})
      
      
    }).catch(()=>{
      userHelpers.createUser(req.body).then((data)=>{
        res.json({user:true})
      })
       .catch((err)=>{
         console.log(err);
       })
   
      })
    }else{
      res.redirect('/login') 
    }
    }
})
router.get('/category', (req, res) => {
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
    productHelpers.showCategory().then((category) => {
      res.render('admin/category', { admin: true, category })
    })
  } else {
    res.redirect('/')
  }
}

})
router.get('/add-category', (req, res) => {
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
    res.render('admin/add-category', ({ admin: true }))
  } else {
    res.redirect('/')
  }
}
})
router.post('/add-category', (req, res) => {
  console.log(req.body, 'add-category');
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){

    productHelpers.insertCategory(req.body).then(() => {
      res.json({ status: true })
    }).catch(() => {
      res.json({ status: false })
    })
  } else {
    res.redirect('/')
  }
}
})
router.get('/edit-category/:id', (req, res) => {
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
    proId = req.params.id

    productHelpers.showOneCategory(proId).then((category) => {
      res.render('admin/edit-category', { admin: true, category })
    })
  } else {
    res.redirect('/')
  }
}

})
router.post('/edit-category', (req, res) => {
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
    productHelpers.updateCategory(req.body.proId, req.body.productCategory).then(() => {
      res.json({ status: true })
    })
      .catch(() => {
        res.json({ status: false })
      })
  } else {
    res.redirect('/')
  }
}
})
router.get('/delete-category/:id', (req, res) => {
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
 
    
    proId = req.params.id
    productHelpers.deleteCategory(proId).then(() => {
      res.redirect('/category')
    })
  } else {
    res.redirect('/')
  }
}

})
router.get('/get-all-orders', (req, res) => {
  userHelpers.getAllOrders().then((allOrders) => {

console.log(allOrders);
    res.render('admin/viewOrder-details', { admin: true, allOrders })
  })
})
router.get('/ship-order/:id', (req, res) => {
  userHelpers.shipOrder(req.params.id).then(() => {
    res.redirect('/get-all-orders')
  })
})
router.get('/cancel-order/:id', (req, res) => {
  userHelpers.cancelOrder(req.params.id).then(() => {
    res.redirect('/get-all-orders')
  })
})
router.get('/offers', (req, res) => {
  productHelpers.getAllproducts().then((products) => {



    res.render('admin/pro-offers', { admin: true, products })
  })
})
router.get('/category-offer',(req,res)=>{
  productHelpers.showCategory().then((categories)=>{
    console.log('categories',categories);
    res.render('admin/offers-to-category',{admin:true,categories})
  })
  
})
router.get('/add-offer/:id', (req, res) => {
  productHelpers.viewOneProduct(req.params.id).then((singleProduct)=>{
    console.log('singleProduct',singleProduct);
    res.render('admin/add-offer-item',{singleProduct})
  })
})
router.post('/update-offer/:id',(req,res)=>{
  proId=req.params.id
  console.log('id',proId,'offer',req.body);
  productHelpers.updateOffer(proId,req.body).then(()=>{
    res.redirect('/offers')
  })
})
router.get('/delete-offer/:id',(req,res)=>{
  proId=req.params.id
  productHelpers.removeOffer(proId).then(()=>{
    res.redirect('/offers')
  })
})
router.get('/add-category-offer/:id',(req,res)=>{
  productHelpers.showOneCategory(req.params.id).then((singleCategory)=>{
    console.log('category single',singleCategory);
    res.render('admin/offer-to-category-update',{singleCategory})
    
  })
})

router.post('/add-category-offer/:id',(req,res)=>{
  console.log('params add category',req.params.id,'bo category',req.body);
  proId=req.params.id
  productHelpers.updateCategoryOffer(proId,req.body).then(()=>{
    res.redirect('/category-offer')
  })
})
router.get('/delete-category-offer/:id',(req,res)=>{
  console.log('id here',req.params.id)
  productHelpers.removeCategoryOffer(req.params.id).then(()=>{
    res.redirect('/category-offer')
  })
})
router.get('/coupon',(req,res)=>{
  userHelpers.getAllCoupons().then((coupons)=>{
    console.log('all coupons',coupons);
    res.render('admin/coupon',{admin:true,coupons})
  })
  
})
router.get('/generate-code-form',(req,res)=>{
  res.render('admin/coupon-form',{admin:true})
})
router.post('/generate-code',(req,res)=>{
  console.log('hi generate');
  let generateCode=voucher_codes.generate({
    length:8,
    count:5
  })
  console.log(generateCode[0]);
  console.log('reqbody',req.body);
  userHelpers.saveCoupon(generateCode[0],req.body).then(()=>{
    res.redirect('/coupon')
  })
})
router.get('/delete-coupon/:id',(req,res)=>{
  proId=req.params.id

  userHelpers.deleteCoupon(proId).then(()=>{
    res.redirect('/coupon')
  })
  
})
module.exports = router;

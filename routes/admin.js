var express = require('express');
const user_controller = require('../controller/user_controller');
var router = express.Router();
const productHelpers=require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers')
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
     res.render('admin/home',{admin:true,userName:user,roles:role})
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
      productHelpers.getAllproducts().then((products)=>{
   
        res.render('admin/view-products',{admin:true,products,userName:user,roles:role})
        })
    }else{
      res.redirect('/login') 
  }
  }
 

})
router.get('/add-product',verifyLogin,function(req,res){
  res.render('admin/add-product',{admin:true})
})

router.post('/add-product',(req,res)=>{
 

  productHelpers.addProduct(req.body,(id)=>{
    let image=req.files.Image
    
   image.mv('./public/img/product-images/'+id+'.jpg',(err)=>{
     if(!err){
      res.render('admin/add-product')
     }else{
       console.log(err)
     }
   })
   
  })
  })
  router.get('/admin/delete-product/:id',verifyLogin,(req,res)=>{
    let proId=req.params.id
   
    productHelpers.deleteProduct(proId).then((response)=>{
      res.redirect('/admin')
    })
  })
  
router.get('/admin/edit-product/:id',verifyLogin,async(req,res)=>{

  let product=await productHelpers.getProductDetails(req.params.id)
 
  res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id',(req,res)=>{
  
  let id=req.params.id
 
  productHelpers.updateProduct(req.params.id,verifyLogin,req.body).then(()=>{
    res.redirect('/admin')
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
  let user=req.session.name
  let role=req.session.role
  if (user){
    if(role===0){
  let userId=req.params.id
  userHelpers.blockUser(userId).then((data)=>{
    res.redirect('/users')
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

module.exports = router;

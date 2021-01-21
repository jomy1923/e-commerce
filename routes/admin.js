var express = require('express');
const user_controller = require('../controller/user_controller');
var router = express.Router();
const productHelpers=require('../helpers/product-helpers')


/* GET home page. */
router.get('/admin', function(req, res) {
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
 
});
router.get('/add-product',function(req,res){
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
  router.get('/admin/delete-product/:id',(req,res)=>{
    let proId=req.params.id
   
    productHelpers.deleteProduct(proId).then((response)=>{
      res.redirect('/admin')
    })
  })
  
router.get('/admin/edit-product/:id',async(req,res)=>{

  let product=await productHelpers.getProductDetails(req.params.id)
 
  res.render('admin/edit-product',{product})
})

router.post('/edit-product/:id',(req,res)=>{
  
  let id=req.params.id
 
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
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
module.exports = router;

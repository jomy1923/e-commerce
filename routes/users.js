const e = require('express');
var express = require('express');
var router = express.Router();
const userController=require('../controller/user_controller')
const productHelpers=require('../helpers/product-helpers')
const varifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
     res.redirect('/login')
  }
}
/* GET users listing. */
router.get('/', async function(req, res) {
  let role = req.session.role
  let ifSession = req.session.name;
  
  if (ifSession) {
    if(role===0){
      res.redirect('/admin')
    }
    else{
      let cartCount=await userController.getCartCount(req.session.name._id)
      productHelpers.getAllproducts().then((products)=>{
        res.render('user/index',{products,cartCount,userName:ifSession,roles:role})
        })
    }
  } else {
    res.redirect('login')
  }

});
router.post('/register',(req,res)=>{
  let role = req.session.role
  let ifSession = req.session.name;
  if (ifSession) {
    if(role===0){
      res.redirect('/admin')
    }
    else{
    res.render("user/index",{userName:ifSession,roles:role});
    }
  }else{
    userController.idExists(req.body.uname).then((data)=>{
      
        res.json({user:false})
      
      
    })
    .catch(()=>{
      userController.register(req.body).then((data)=>{
        res.json({user:true})
      })
       .catch((err)=>{
         console.log(err);
       })
   
      })
  

  } 
  
  
  })

router.post('/login',function(req,res){
  let ifSession = req.session.name;
  let role = req.session.role
  if (ifSession) {
    if(role===0){
      res.redirect('/admin')
    } 
    else{
    res.render("user/index",{user:true,userName:ifSession,roles:role});
    }
  }else{
    userController.login(req.body).then((response)=>{
    
      req.session.loggedIn=true
       req.session.name=response.user
       req.session.role=response.user.role
       res.send({ user: true,roles:role }); 
   })
   .catch((response) => {
     res.send({ user: false,roles:role });
   });
   

  }
  
});
router.get('/login',(req,res)=>{
  let ifSession = req.session.name;
  console.log(ifSession,'section name');
  let role = req.session.role
  if (ifSession) {
    if(role===0){
      res.redirect('/admin')
    }
    else{
    res.render("user/index",{user:true,userName:ifSession,roles:role});
    }
  } else {
  res.render('user/login')
  }
})
router.get('/register',(req,res)=>{
  let role = req.session.role
  let ifSession = req.session.name;
  if (ifSession) {
    if(role===0){
      res.redirect('/admin')
    }
    else{
    res.render("index",{userName:ifSession,roles:role});
    }
  } else {
    res.render("user/register");
  }
  
})
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
router.get('/cart',varifyLogin,async(req,res)=>{
  let cartCount=await userController.getCartCount(req.session.name._id)
  let products=await userController.getCartProducts(req.session.name._id)
  
  res.render('user/cart',{products,cartCount})
})
router.get('/add-to-cart/:id',varifyLogin,(req,res)=>{
 
userController.addToCart(req.params.id,req.session.name._id).then(()=>{
  res.json({status:true})
})
})



module.exports = router;

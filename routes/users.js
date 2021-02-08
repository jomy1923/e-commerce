const e = require("express");
var express = require("express");
var router = express.Router();
const userController = require("../controller/user_controller");
const productHelpers = require("../helpers/product-helpers");
var axios = require("axios");
var FormData = require("form-data");
var otpid;
const varifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
/* GET users listing. */
router.get("/", async function (req, res) {
  let role = req.session.role;
  let ifSession = req.session.name;

  if (ifSession) {
    if (role === 0) {
      res.redirect("/admin");
    } else {
      let cartCount = await userController.getCartCount(req.session.name._id);
      productHelpers.getAllproducts().then((products) => {
        res.render("user/index", {
          products,
          cartCount,
          userName: ifSession,
          roles: role,
        });
      });
    }
  } else {
    res.redirect("login");
  }
});
router.post("/register", (req, res) => {
  let role = req.session.role;
  let ifSession = req.session.name;
  if (ifSession) {
    if (role === 0) {
      res.redirect("/admin");
    } else {
      res.render("user/index", { userName: ifSession, roles: role });
    }
  } else {
    userController
      .idExists(req.body.uname)
      .then((data) => {
        res.json({ user: false });
      })
      .catch(() => {
        userController
          .register(req.body)
          .then((data) => {
            res.json({ user: true });
          })
          .catch((err) => {
            console.log(err);
          });
      });
  }
});

router.post("/login", function (req, res) {
  let ifSession = req.session.name;
  let role = req.session.role;
  if (ifSession) {
    if (role === 0) {
      res.redirect("/admin");
    } else {
      res.render("user/index", {
        user: true,
        userName: ifSession,
        roles: role,
      });
    }
  } else {
    userController
      .login(req.body)
      .then((response) => {
        console.log(response, "after user controller response");
        req.session.loggedIn = true;
        req.session.name = response.user;
        req.session.role = response.user.role;
        res.json({ user: true, roles: role });
      })
      .catch((response) => {
        console.log(response, "user response");
        if (response.block) {
          res.json({ block: true });
        } else if (response.invalidUser) {
          res.json({ invalidUser: true });
        }
      });
  }
});
router.get("/login", (req, res) => {
  let ifSession = req.session.name;
  console.log(ifSession, "section name");
  let role = req.session.role;
  if (ifSession) {
    if (role === 0) {
      res.redirect("/admin");
    } else {
      res.render("user/index", {
        user: true,
        userName: ifSession,
        roles: role,
      });
    }
  } else {
    res.render("user/login");
  }
});
router.get("/register", (req, res) => {
  let role = req.session.role;
  let ifSession = req.session.name;
  if (ifSession) {
    if (role === 0) {
      res.redirect("/admin");
    } else {
      res.render("index", { userName: ifSession, roles: role });
    }
  } else {
    res.render("user/register");
  }
});
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});
router.get("/cart", varifyLogin, async (req, res) => {
  userController
    .getCartProducts(req.session.name._id)
    .then(async (products) => {
      console.log('hoiehdioh',products);
      let totalValue = 0;
      if (products.length > 0) {
        console.log('enterwd');
        let cartCount = await userController.getCartCount(req.session.name._id);
        totalValue = await userController.getTotalAmount(req.session.name._id);
        
        res.render("user/cart", {
          products,
          cartCount,
          userName: req.session.name,
          totalValue,
          
        });
      } else {
        console.log('kthis us eelswe');
        res.render("user/empty-cart", { userName: req.session.name });
      }
    })
    .catch((response) => {
      res.render("user/empty-cart", { userName: req.session.name });
    });
});
router.get("/add-to-cart/:id", varifyLogin, (req, res) => {
  let role = req.session.role;
  let ifSession = req.session.name;

  if (ifSession) {
    if (role === 0) {
      res.redirect("/admin");
    } else {
  
  console.log(req.params.id,'add to cart user id');
  userController.addToCart(req.params.id, req.session.name._id).then(() => {
    
    res.json({ status: true });
  });
} 

}
});
router.post("/change-product-quantity", (req, res) => {
  console.log(req.body, "post product quantity");
 
  userController.ChangeProductQuantity(req.body).then(async (response) => {
    console.log('at change product quantity',response);
   
    
    response.singleTotal = await userController.getSingeTotal(req.session.name._id, req.body.product)
    
    response.total = await userController.getTotalAmount(req.session.name._id);
    if(response.singleTotal>0 && response.total>0){
      res.json(response);
    }else{
      console.log('ethii');
      res.json({removeProduct:true})
    }
    
console.log('respoonse',response);
    
  });
});

router.post("/delete-product", (req, res) => {
  console.log(req.body, "haiii jomy");
  userController.DeleteProduct(req.body).then((response) => {
    res.json(response);
  });
});
router.get("/place-order", varifyLogin, async (req, res) => {
  let cartCount = await userController.getCartCount(req.session.name._id);
  let total = await userController.getTotalAmount(req.session.name._id);
  res.render("user/place-order", {
    total,
    cartCount,
    userName: req.session.name,
  });
});

router.post("/place-order", async (req, res) => {
  let products = await userController.getCartProductList(req.body.userId);
  let totalPrice = await userController.getTotalAmount(req.session.name._id);
  userController.placerOrder(req.body, products, totalPrice).then((orderId) => {
    console.log(req.body, "jjjjj");
    if (req.body["payment-method"] == "COD") {
      res.json({ codSuccess: true });
    } else {
      userController.generateRazorpay(orderId, totalPrice).then((response) => {
        res.json(response);
      });
    }
  });
  console.log(req.body, "check out form");
});
router.get("/order-success", varifyLogin, async (req, res) => {
  let cartCount = await userController.getCartCount(req.session.name._id);
  res.render("user/order-success", { userName: req.session.name, cartCount });
});
router.get("/view-orders", varifyLogin, async (req, res) => {
  let cartCount = await userController.getCartCount(req.session.name._id);
  console.log("order is working", req.session.name);
  let orders = await userController.getUserOrder(req.session.name._id);
  console.log(orders, "qwertyuiolkjhgfds");

  res.render("user/view-orders", {
    userName: req.session.name,
    orders,
    cartCount,
  });
});
router.get("/view-order-products/:id", varifyLogin, async (req, res) => {
  let cartCount = await userController.getCartCount(req.session.name._id);
  let product = await userController.getOrderProducts(req.params.id);
  res.render("user/view-order-products", {
    userName: req.session.name,
    product,
    cartCount,
  });
});
router.post("/verify-payment", (req, res) => {
  console.log(req.body);
  userController
    .verifyPayment(req.body)
    .then(() => {
      userController
        .changePaymentStatus(req.body["order[receipt]"])
        .then(() => {
          console.log("payment success");
          res.json({ status: true });
        });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "payment failed" });
    });
});
router.get("/otp-login", (req, res) => {
  if (req.session.user) {
    res.redirect("/user-home");
  } else {
    res.render("user/otp-register");
  }
});
router.post("/otp-login", (req, res) => {
  console.log(req.body);
  userController
    .otpUserCheck(req.body)
    .then(() => {
      var data = new FormData();
      data.append("mobile", +91 + req.body.mobile);
      data.append("sender_id", "SMSINFO");
      data.append("message", "Your otp code is {code}");
      data.append("expiry", "900");

      var config = {
        method: "post",
        url: "https://d7networks.com/api/verifier/send",
        headers: {
          Authorization: "Token b3b6ad053db9909cf29b8946712eeb1388acec39",
          ...data.getHeaders(),
        },
        data: data,
      };

      axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          otpid = response.data.otp_id;
          res.json({ status: true });
        })
        .catch(function (error) {
          console.log(error);
        });
    })
    .catch(() => {
      res.json({ status: false });
    });
});
router.post("/otp-login-verify", (req, res) => {
  userData = req.body;
  var data = new FormData();
  data.append("otp_id", otpid);
  data.append("otp_code", userData.otp);

  var config = {
    method: "post",
    url: "https://d7networks.com/api/verifier/verify",
    headers: {
      Authorization: "Token b3b6ad053db9909cf29b8946712eeb1388acec39",
      ...data.getHeaders(),
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      if (response.data.status == "success") {
        userController.otpLogin(req.body).then((user) => {
          req.session.name = user;
          res.json({ status: true });
        });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
});
router.post("/resend-otp", (req, res) => {
  var data = new FormData();
  data.append("otp_id", otpid);

  var config = {
    method: "post",
    url: "https://d7networks.com/api/verifier/resend",
    headers: {
      Authorization: "Token b3b6ad053db9909cf29b8946712eeb1388acec39",
      ...data.getHeaders(),
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      res.json({ status: true });
    })
    .catch(function (error) {
      console.log(error);
    });
});
router.post('/delete-cart', (req, res) => {

console.log('wertyu',req.body);
  userController.deleteCart(req.body).then((response) => {
    res.json(response)
  })
})
router.get('/product-view/:id',varifyLogin,(req, res) => {
  

  productHelpers.viewOneProduct(req.params.id).then((product) => {
    console.log('product',product);

    res.render('user/product-details', { product, userName: req.session.name, })
  })

})

module.exports = router;

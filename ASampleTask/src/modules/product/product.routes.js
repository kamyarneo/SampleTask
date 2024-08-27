const express = require("express");

//Product Services controler
const controller = require("./product.controller");

//Authentication & Authorization Middlewares
const auth = require("./../../middlewares/auth");
const accountVerify = require("./../../middlewares/accountVerify");

const router = express.Router();

router
  // get all products ordered by creation Date (desending) of Product
  // user must be logged-in (access-token needed) & verified
  .route("/allProducts")
  .post(auth, accountVerify, controller.allProducts)
router
  .route("/allProducts/count")
  .post(auth, accountVerify, controller.allProductsCount)
  

router
  // get use products ordered by creation Date (desending) of Product
  // user must be logged-in (access-token needed) & verified
  .route("/userProducts")
  .post(auth, accountVerify, controller.userProducts)
router  
  .route("/userProducts/count")
  .post(auth, accountVerify, controller.userProductsCount)


router
  // user must be logged-in (access-token needed) & verified
  // add new Product for the user (access-token.userID)
  // props: productName & description
  .route("/addProduct")
  .post(auth, accountVerify, controller.addProduct)
router
  // user must be logged-in (access-token needed) & verified
  // delete Product for the user (access-token.userID)
  // props: productName
  .route("/deleteProduct")
  .delete(auth, accountVerify, controller.deleteUserProduct) 

module.exports = router;

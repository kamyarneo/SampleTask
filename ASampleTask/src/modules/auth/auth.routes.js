const express = require("express");
const controller = require("D:/NodeApp/ASample/src/modules/auth/auth.controller"); 


const router = express.Router();

router  // register new user
  .route("/register")
  .post(controller.register);

router  // login by email & password
  .route("/login")
  .post(controller.login);

router  // email Token Verification  
  .route("/verify/")
  .get(controller.verifyEmail);  

router  // resetting pasword by emailing resetToken 
  .route("/resetPassword")
  .post(controller.resetPassword);   

router  // setting new password with resetToken
  .route("/setPassword")
  .post(controller.setPassword);   

module.exports = router;

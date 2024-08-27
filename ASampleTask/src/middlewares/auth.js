const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { errorResponse } = require("../utils/responses")

const UserModel = require("./../models/User");

module.exports = async (req, res, next) => {

  //getting Autorization setting from header
  const authHead = req.get("Authorization");
  if (authHead === undefined) {
    errorResponse(res, 401, "JWToken required! login again....", "");
    return;
  }

  //bypassing Bearer
  token = authHead.split(' ')[1]; 

  let payload = null;
  try {  
    payload = await jwt.verify(token, process.env.JWT_SECRET);
  } catch(error) {
    errorResponse(res, 401, "Invalid JWToken! login again....", "");
    return;
  };
  
  try {
    const userID = payload.userID;
    //checking userID is a valid ObjectId for mongoose
    if (!mongoose.Types.ObjectId.isValid(userID)) {
      errorResponse(res, 401, "Invalid MogoID !  login again....", "");
      return;
    }      
    const user = await UserModel.findOne({ _id: userID }).lean();
    if (!user) {
      errorResponse(res, 401, " Invalid user ID ! login again....", "");
      return;
    }
    
    req.user = user;
    req.user._id = userID;
    req.user.password = "";


    next();
  
  } catch (err) {
    errorResponse(res, 401, "Invalid user! login again....", "");
    return;
  }
};

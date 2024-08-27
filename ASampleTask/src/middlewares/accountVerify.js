

const { errorResponse } = require("../utils/responses");

module.exports = async (req, res, next) => {
  try {
    const isVerified = req.user.isVerified;
    
    if (!isVerified) {
      errorResponse(res, 401, "You need to verify your account", "");
      return;
    }
    //console.log("Verify user :", req.user);
    
    next();
  } catch (err) {
    errorResponse(res, 500, " Verification Internal Error", "");
    return;
  }
};

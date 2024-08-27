const { errorResponse } = require("../utils/responses");
exports.errorHandler = (err, req, res, next) => {
  errorResponse(res, 500, " Unexpected internal error!...", err);  
};

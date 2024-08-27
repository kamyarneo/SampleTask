//global logger
const Logger = require("../startup/logger");

// Helper function to fort success responses
const successResponse = (res, statusCode = 200, data) => {
  return res
    .status(statusCode)
    .json({ status: statusCode, success: true, data:data });
};

//Helper function to for error responses
const errorResponse = (res, statusCode, message, data) => {
  console.log({ statusCode, message, data }); // Log error details 
  Logger.logError(JSON.stringify({ statusCode, message, data }))
  return res
    .status(statusCode)
    .json({ status: statusCode, success: false, error: message, data });
};


module.exports = {
  successResponse,
  errorResponse,
};

const { errorResponse } = require("../utils/responses");
exports.detectValidationErrors = function (result, res) {
   if (result.error) {
      //console.log(error.details);
      let message = result.error.details.map(i => i.message).join('');
      let msg = message.replace(/"/g, "*");
      console.log("error", msg );
      errorResponse(res, 422, "Input validation error!...",msg);
      return true;
   } else {
      return false;
   }
}
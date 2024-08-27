
const  Logger = require("./logger");

module.exports = () => {
   process.on("unhandledRejection", (ex) => {
      Logger.logError("error unhandledRejection!...");
      Logger.logInfo("error unhandledRejection!...");
      // tihs Exception is being caught by winston
      // (logs it and exits node process )
      // see settings in /startup/logger.js 
      throw ex;
   });
}
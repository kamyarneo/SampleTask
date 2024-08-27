const  Logger  = require("./logger");
const { default: mongoose } = require("mongoose");
const productModel = require("../models/Product");
const userModel = require("../models/User");

const dbConnect = async function () {
   try {
      await mongoose.connect(process.env.MONGO_URI);
      Logger.logInfo(`MongoDB Connected Successfully: ${mongoose.connection.host}`);
   } catch (err) {
      Logger.logInfo('Error in DB connection ->', err);
      Logger.logInfo('Server exited!...');
      throw err;
      //winston logs err details and exit node process
   }

   //for not conflicting  with jest this section is commented out
   //............................................................
   // mongoose.connection.on('disconnected', () => {
   //    Logger.logError('MongoDB disconnected! ...');
   //    Logger.logInfo('MongoDB disconnected! ...');
   //    throw new Error(" MongoDB Disconnected!... Server Exits...");
   //    // tihs Exception is being caught by winston
   //    // (logs it and exits node process )
   //    // see settings in /startup/logger.js 
   // });

}
const emptyModels = async function  () {
   await userModel.deleteMany({});
   await productModel.deleteMany({});
   console.log(await productModel.countDocuments({}));
   console.log(await userModel.countDocuments({}));
}
module.exports = { dbConnect, emptyModels }
const express = require("express");
const cookieParser = require("cookie-parser");
const { corsHeader } = require("./middlewares/headers");
const { dbConnect } = require("./startup/db");
const  Logger  = require("./startup/logger"); // Global Logger Class
const dotenv = require("dotenv");


dotenv.config();//init config setup and env variables
Logger.initialize(); // set up Logger
require("./startup/exceptions")(); //set unhandledRejection handler
dbConnect(); // connect to mongoDB

const app = express();

// Parsers
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" })); //json parser
app.use(cookieParser()); // Cookie Parse
app.use(corsHeader);// CORS Policy


require("./startup/routes")(app); //invoke Routing and errorHandler

const port = +process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
module.exports = server;
      

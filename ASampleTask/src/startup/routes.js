
const { errorHandler } = require("../middlewares/errorHandler");
const notFoundPath = require("../middlewares/notFoundPath");
const authRoutes = require("../modules/auth/auth.routes");
const productRoutes = require("../modules/product/product.routes");


//* Routes
module.exports = function (app) { 
  app.use("/products", productRoutes);
  app.use("/users", authRoutes);

  // 404 Error 
  app.use(notFoundPath);
  //error handling middleware
  app.use(errorHandler);
}
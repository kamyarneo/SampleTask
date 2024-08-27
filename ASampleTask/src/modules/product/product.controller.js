
const { errorResponse, successResponse } = require("../../utils/responses");
const { detectValidationErrors } = require("../../utils/detectValidationErrors");

const ProductModel = require("./../../models/Product");
const { productValidation, 
        productNameValidation,
        pagingValidation,
      } = require("./product.validators");






//get Counts section
//..................
exports.allProductsCount = async (req, res, next) => {
  getProductsCount (req, res, true) //true : allProducts
  return;
}
exports.userProductsCount = async (req, res, next) => {
  getProductsCount(req, res, false) //false : No allProducts
  return;
}
const getProductsCount = async  (req, res, allProducts) => { 
  try {
    userID = req.user._id;

    let productsCount = 0;
    if (allProducts) //count all documents
      productsCount = await ProductModel.estimatedDocumentCount();
    else            //count for userID documents
      productsCount = await ProductModel.countDocuments({ userID })
    
    successResponse(res, 200,
      {
        message: allProducts ? "All products counted: " + productsCount.toString() : "User products counted: " + productsCount.toString(),
        Count: productsCount
      });
    return;

  } catch (err) {
    errorResponse(res, 500, " Internal error!...", err);
    return;
  }
}



//get Products section
//..................
exports.userProducts = async (req, res, next) => {
  getProducts(req, res, false) //false :Not allProducts
  return;
}
exports.allProducts = async (req, res, next) => {
  getProducts(req, res, true) //true : AllProducts
  return;
}
getProducts = async function (req, res, allProducts) {    
  const { page, size } = req.body;
  const userID = req.user._id;

  const result = pagingValidation.validate(
    { page, size }
  );
  //console.log(page, size);

  
  //if error detected in validation proccess
  // it extracts errors and sets res 
  if (detectValidationErrors(result, res)) {
    return;
  }

  try {
    // find all products for userID
    let products;
    let skip = size * (page - 1);
    if (allProducts) 
      products = await ProductModel.
        find().sort({ dateAdded: -1 }).limit(size).skip(skip).lean();
    else
      products = await ProductModel.
        find({ userID }).sort({ dateAdded: -1 }).limit(size).skip(skip).lean();
      

    successResponse(res, 200, {
      message: "Product Listed, Ok...",
      products,
    });
    return;

  } catch (err) {
    errorResponse(res, 500, " Internal error!...", err);
    return;
  }
};





exports.addProduct = async (req, res, next) => {

  // user must be logged-in (access-token needed) & verified
  // add new Product for the user (access-token.userID)
  // props: ProductName & Description

  const { productName, description } = req.body;
  const userID = req.user._id;
    
  const result = productValidation.validate({
    productName, description
  });
  
  //if error detected in validation proccess
  // it extracts errors and sets res 
  if (detectValidationErrors (result, res) ) {
    //console.log(error.details);
    return;
  }
  
  try {
    // if the product already exists
    const productExists = await ProductModel.findOne(
      { productName , userID });

    if (productExists) {
      errorResponse(res, 405, " Product already exists!...", "");
      return;
    }

    // adding product document to its Model
    let prodDoc = new ProductModel({
      productName, description, userID 
    });
    let addedDoc = await prodDoc.save();
    if (!addedDoc) {
      errorResponse(res, 505, " MongoDB Internal error!...", err);
      return;
    }
    
    successResponse(res, 200, {
      message : "Product created successfully Ok.",
      product : addedDoc,
    });
    return;

  } catch (err) {
    errorResponse(res, 500, " Internal error!...", err);
    return;
  }
};

exports.deleteUserProduct = async (req, res, next) => {
  // user must be logged-in (access-token needed) & verified
  // delete a Product for the user (access-token.userID)
  // props: ProductName 
 
  const { productName } = req.body;
  const userID = req.user._id;

  const result = productNameValidation.validate({ productName });

  //if error detected in validation proccess
  // it extracts errors and sets res 
  if (detectValidationErrors(result, res)) {
    return;
  }

  try {
    // if the product already exists
    const productExists = await ProductModel.findOne(
      { productName, userID });

    if (!productExists) {
      errorResponse(res, 405, " Product does not exists!...", "");
      return;
    }

    // deleting product document from its Model 
    const deletedDoc = await ProductModel.findOneAndDelete(
      { productName, userID });

    if (!deletedDoc) {
      errorResponse(res, 505, " MongoDB Internal error!...", err);
      return;
    }

    successResponse(res, 200, {
      message : "Product deleted successfully Ok.",
      product : deletedDoc,
    });
    return;

  } catch (err) {
    errorResponse(res, 500, " Internal error!...", err);
    return;
  }
};



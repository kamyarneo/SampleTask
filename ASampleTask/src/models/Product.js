const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    minLength: 3,
    maxLength:100,
    required: true,
  },
  description: {
    type: String,
    minLength: 10,
    maxLength:500,
    required: true,
  },
  dateAdded: {
    type: Date,
    default: Date.now 
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const model = mongoose.model("Product", productSchema);

module.exports = model;

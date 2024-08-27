const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      maxLength:100,
      lowercase: true,
    },
    name: {
      type: String,
      minLength: 3,
      maxLength:30,
      required: true,
    },
    family: {
      type: String,
      minLength: 3,
      maxLength: 30,
      required: true,
    },
    password: {
      type: String, 
      required: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetTokenExpiration:{
      type : Date,
    },
    verificationToken: {
      type: String, 
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);


schema.pre("save",  async function (next) {
  try {
    //this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

const model = mongoose.model("User", schema);

module.exports = model;

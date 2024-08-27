const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const Mailer = require("../../startup/mailer")
const { getHashOf, validateHash } = require("../../utils/hashing");
const { errorResponse, successResponse } = require("../../utils/responses");

const { detectValidationErrors } = require("../../utils/detectValidationErrors");

const UserModel = require("./../../models/User");

const {
  registerValidation,
  loginValidation,
  verifyValidation,
  resetValidation,
  setPasswordValidation
} = require("./auth.validator");



exports.register = async (req, res, next) => {

  
  const {  name, family, email, password } = req.body;

  const result =  registerValidation.validate({ name, email, family, password });
  //if error detected in validation proccess
  // it extracts errors and sets res 
  if (detectValidationErrors(result, res)) return;
  
    
  try {
    const foundUser = await UserModel.findOne({ email } ).lean();
    
    if (foundUser) {
      errorResponse(res, 422, " Duplicate email", "null");
      return;
    }

    // building Token for Email verification 
    //....
    const verificationToken = await crypto.randomBytes(12).toString('hex');
   
    // saving user document
    //.....
    const hashPassword = await getHashOf(password);
    let user = new UserModel({
      email, name, family, password: hashPassword,
      verificationToken
    });
    
    user = await user.save();
    if (!user) {
      errorResponse(res, 500, "Internal Error!..", "");
      return;
    }

    //sending an email for verification of user email
    //...
    Mailer.initialize();
    const mailOptions = {
      from: "kamyar.jazayeri@gmail.com",
      to: email,
      //to: "kamyar.jazayeri@gmail.com",
      subject: "Successful Registeration",
      html: `
       <h2>Hi, dear  ${user.name}</h2>
       <p> to verify your email please </p>
       <p> click this link <a href="http://localhost:3000/users/verify/?token=${verificationToken}&email=${email}">---- verify ----</a> </p>
      `,
    };

    try {
       await Mailer.sendEMail(mailOptions);
    }catch (err) {
        errorResponse(res, 500, " Nodemailer Internal Error", err);
        return;
    }



    successResponse(res, 200, {
      message:"User created successfully Ok.",
      user: { ...user.toObject(), password: undefined },
    });
    return;

  } catch (err) {
    errorResponse(res, 500, "N Internal Error", "null");
    return;
  }
  };
  
exports.login = async (req, res, next) => {
  //console.log('login api');
  //return res.json({ msg: "login api" });

  try {
    const { email, password } = req.body;

    const result = loginValidation.validate(
      { email, password, }
    );
    if (detectValidationErrors(result, res)) return;


    const user = await UserModel.findOne({ email }).lean();

    if (!user) {
      errorResponse(res, 410,"Invalid email", email);
      return;
    }

    const isPasswordMatch = await validateHash(password, user.password);

    if (!isPasswordMatch) {
      errorResponse(res, 410, "Password is not valid!...", null);
      return;
    }

    // creating access token
    const accessToken = await jwt.sign(
      { userID: user._id, email: email },    
      process.env.JWT_SECRET, { expiresIn: "1h", });
                            // token expires in 1 hour
      

    successResponse(res, 200, {
      message: "Signed-In was successful Ok",
      user: { ...user, password: undefined },
      accessToken,
      userID: user._id,
    });
    return;

  } catch (err) {
    errorResponse(res, 500, "Login internal Error!...", null);
    return;
  }
};


exports.setPassword = async (req, res, next) => {
  //console.log('setPassword api');

  const { email, resetToken, newPassword } = req.body;
  const result = setPasswordValidation.validate(
    { email, resetToken, newPassword }
  );
  if (detectValidationErrors(result, res)) return;

  try {

  let resetUser;  
    resetUser = await UserModel.findOne({
      resetPasswordToken: resetToken,
      resetTokenExpiration: { $gt: Date.now() },
      email,
    }).lean();
    if (!resetUser) {
      errorResponse(res, 410, "Invalid email or invalid token or expiry of reset time!...", {email,resetToken});
      return;
    }
    const hashPassword = await getHashOf(newPassword);
    user = await UserModel.findOneAndUpdate({ email },      
      {
        // password will be hashed by Schema.pre("save")
        password : hashPassword,
        resetPasswordToken: null,
        resetTokenExpiration : null
      })
    if (!user) {
      errorResponse(res, 500, "Internal Error!...", "MongoDB...");
      return;
    }
    successResponse(res, 200,
      {
        message: "Password set successfully Ok.",
        email,
        hashPassword
      });
    return;
    
  } catch {
    errorResponse(res, 500, "Internal error!...", {});
    return;
  }
};

exports.resetPassword = async (req, res, next) => {
  //console.log('resetPassword api');
  //return res.json({ msg: "resetPassword api" });

  const { email } = req.body;
  const result = resetValidation.validate({ email });
  if (detectValidationErrors(result, res)) return;
     
  try {
    const user = await UserModel.findOne({ email }).lean();
    if (!user) {
      errorResponse(res, 410, "Invalid email!...", "");
      return;
    }

    const token = await crypto.randomBytes(12).toString("hex");

    //saving reset fields
    const updatedUser = await UserModel.findOneAndUpdate({ email },
      {
        resetTokenExpiration: Date.now() + 3600000, //1hour
        resetPasswordToken : token,
       }
    );
    if (!updatedUser) {
      errorResponse(res, 500, "Internal Error!...", "");
      return;
    }

    // sending email with a token to assign new password
    //.....
    Mailer.initialize();
    const mailOptions = {
      from: "kamyar.jazayeri@gmail.com",
      to: email,
      subject: "Reset password link for your account",
      html: `
       <h2>Hi, dear ${user.name}</h2>
       <p> You requested a password reset</p>
       <p> Please go to 'Set Password Page', and use </p>
       <p> this code ${token} to set a new password.</p>
       <p> this code is valid for 1 hour </p>
      `,
    };

    try {
      await Mailer.sendEMail(mailOptions);
    } catch (err) {
      errorResponse(res, 500, " Nodemailer Internal Error", err);
      return;      
    }

    successResponse(res, 200, 
      {
        message: "Password reset successed, Ok.",
        email,
        resetToken: token,
      });
    return;

  } catch (err){
    errorResponse(res, 500, "Internal Error!...", err);
    return;
  }
};

exports.verifyEmail = async (req, res, next) => {
  //console.log('verifyEmail api');

  const { email, token } = req.query;

  const result = verifyValidation.validate(
    { email, token, }
  );
``
  if (detectValidationErrors(result, res)) return;
    
  


  try {
    let user;
    // finding user with email and verificationToken
    user = await UserModel.findOne({
      verificationToken: token,
      email,
    });

    //if user not found
    if (!user) {
      errorResponse(res, 410, "Invalid email or invalid token!...", {});
      return;
    }

   
    //user is now verified;
    user = await UserModel.findOneAndUpdate({ email }, { isVerified: true }); 
    if (!user) {
      errorResponse(res, 500, "0 Internal error!...", {});
      return;
    }
    //console.log("Trace");

    successResponse(res, 200, 
      {
        message: "Email Verification  successed, Ok.",
        ...user,
        password: ""
      });
    return;
    
  } catch {
    errorResponse(res, 400, "1 Internal error!...", {});
    return;
  }
};


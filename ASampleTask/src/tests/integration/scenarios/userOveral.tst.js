const request = require("supertest");
const mongoose = require("mongoose");
const Mailer = require("../../../startup/mailer"); 
const Logger = require("../../../startup/logger");
const userModel = require("../../../models/User");
const { emptyModels } = require("../../../startup/db");
const { getHashOf, validateHash } = require("../../../utils/hashing");


let server;

beforeAll(async () => {
   server = require("../../../server");
});
afterAll(async () => {
   //empty users & products models
   await emptyModels();
   await mongoose.disconnect();
   server.close()
});

// there are two scenarios *.test.js
// please test each scenario seperately
describe("User Overal Scenario", () => {

   // define Mock Function to prohibit Mailer & Logger calls
   Mailer.sendEMail = jest.fn();
   Mailer.initialize = jest.fn();
   Logger.initialize = jest.fn();
   Logger.logError = jest.fn();
   Logger.logInfo = jest.fn();


   // In this senario (all happy paths) :
   // -----------------------------------
   // 1) We register a new user 
   // 2) verify the Email of new user to activate account
   // 3) request to reset password and get the reset token
   // 4) set password for user with (email,resetToken,newPassword)
   // 5) login new user with (email, new password) and get accessToken
   // 6) get all Products total count
   // 7) get all Products List with (page:1, size:totCount)
   //    and compare Products recieved length with totCount to be Truthy
   //    and check each product in list contains ProductName & Description
   // 8) Delete all documents in Models created for test in afterAll section
   
   let user = {
      name: "Sabbah",
      family: "Mohammadi",
      email: "Sabbah@me.com",
      password: "66666666",
   }

   let JWToken = "";
   let totCount = 0;
   let verificationToken;
   let resetToken;

   it(" 1) Register new user ...............", async () => {
      let res = await request(server)
         .post("/users/register")
         .send(user);
      
      console.log("1) register\n",
         res.body.data.message);

      expect(res.status).toBe(200);
      expect(Mailer.sendEMail).toHaveBeenCalled();
      // find parameter 0 of last call to mock function
      let j = Mailer.sendEMail.mock.calls.length - 1;
      let param = Mailer.sendEMail.mock.calls[j][0];
      //options of sendEMail "to" prop  must be user.email
      expect(param["to"]).toContain(user.email);
      verificationToken = res.body.data.user.verificationToken

   });
   it(" 2) verify EMail  .................", async () => {
      const routeDetail =
         `/users/verify/?token=${verificationToken}&email=${user.email}`;
      console.log(`Verify : email=${user.email}`);
      const res = await request(server)
         .get(routeDetail);
      
      console.log("2) verify EMail\n",
          res.body.data.message);

      expect(res.body.status).toBe(200);
   });

   it("3) Resetting password   .................", async () => {
      const res = await request(server)
         .post("/users/resetPassword")
         .send({ email: user.email });
      
      console.log(res.body.data.message);

      expect(res.body.status).toBe(200);
      expect(Mailer.sendEMail).toHaveBeenCalled();
      // find parameter 0 of last call to mock function
      j = Mailer.sendEMail.mock.calls.length - 1;
      param = Mailer.sendEMail.mock.calls[j][0];
      //options of sendEMail "to" prop  must be user.email
      expect(param["to"]).toContain(user.email);

      resetToken = res.body.data.resetToken
      //console.log("resetToken:",resetToken);

   });



   it(" 4) Setting new password  .................", async () => {
      let newPassword = "77777777";
      const res = await request(server)
         .post("/users/setPassword")
         .send({
            email: user.email,
            newPassword,
            resetToken,
         });
      
      console.log( res.body.data.message);

      const isPasswordMatch =
         await validateHash(newPassword, res.body.data.hashPassword);
      
      //console.log(res.body);
      expect(res.body.status).toBe(200);     
      expect(isPasswordMatch).toBeTruthy()
      
      user.password = newPassword;

   });

   it(" 5) Login with new password   .................", async () => {

      const res = await request(server)
         .post("/users/login")
         .send({
            email: user.email,
            password: user.password,
         });
      
      console.log(res.body.data.message);

      expect(res.body.status).toBe(200);
      
      JWToken = res.body.data.accessToken;

   });

   it(" 6) Get all products count .................", async () => {

      const res = await request(server)
         .post("/products/allProducts/count")
         .set('Authorization', `bearer ${JWToken}`);
      
      console.log("6) get all products count\n",
           res.body.data.message);

      expect(res.body.status).toBe(200);

      totCount = +res.body.data.Count;

   });

   it(" 7) Get all products list .................", async () => {     
      const res = await request(server)
         .post("/products/allProducts")
         .set('Authorization', `bearer ${JWToken}`)
         .send({
            page: "1",
            // records in the first page
            size: `${totCount+1}`,
         });
      
      console.log(res.body.data.message);

      expect(res.body.status).toBe(200);
      //  Products length  returned must be equal to totCount 
      expect(res.body.data.products.length).toBe(totCount);
      res.body.data.products.forEach(p => {
         expect(p).toHaveProperty("productName");
         expect(p).toHaveProperty("description");
         expect(p).toHaveProperty("userID");        
      });
   });

});
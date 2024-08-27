const request = require("supertest");
const mongoose = require("mongoose");
const { emptyModels } = require("../../../startup/db");
const Mailer = require("../../../startup/mailer");
const Logger = require("../../../startup/logger");
const userModel = require("../../../models/User");
const productModel = require("../../../models/Product");


let server;
beforeAll(async () => {
   server = require("../../../server");
   //empty users & products models
   await emptyModels();
});
afterAll(async () => {
   //empty users & products models
   await emptyModels();
   await mongoose.disconnect();
   server.close()
});


// there are two scenarios *.test.js
// please test each scenario seperately
describe("Products Overal Scenario", () => {
   let firstUser = {
      name: "Marina",
      family: "Jazayeri",
      email: "Marina@me.com",
      password: "77777777",
      ID :""
   }

   let secondUser = {
      name: "Shahin",
      family: "Mohammadi",
      email: "Shain@me.com",
      password: "88888888",
      ID: ""
   }

   // define Mock Function to prohibit Mailer & Logger calls
   Mailer.sendEMail = jest.fn();
   Mailer.initialize = jest.fn();
   Logger.initialize = jest.fn();
   Logger.logError = jest.fn();
   Logger.logInfo = jest.fn();

   //
   // In this senario (all happy paths) :
   // -----------------------------------
   // 1)  We register a new user 
   // 2)  Verify the Email of new user to activate account
   // 3)  Login as first user with (email, password) and get accessToken
   // 4)  Add ten product for this user
   // 5)  Delete two of them
   // 6)  Get user Products total count (must be 8) 
   // 7)  Get user Products List with (page:1, size:10) 
   //     Products length must equal 8.
   //     and check each product in list contains ProductName &
   //     Description properties  & userID = firstUserId 
   // 8)  Register second user 
   // 9)  Vrify the Email of new user to activate account
   // 10) Login as second user with (email, password) and get accessToken
   // 11) Add ten product for this user
   // 12) Delete three of them
   // 13) Get user Products total count (must be 7) 
   // 14) Get user Products List with (page:1, size:10) 
   //     Products length must equal 7.
   //     and check each product in list contains ProductName &
   //     Description properties  & userID = secondUserID
   // 15) Get all Products total count (must be 7+8=15)   
   // 16) Get all Products List with (page:1, size:20)
   //     and compare Products recieved length with totCount to be Truthy
   //     and check each product in list contains ProductName & 
   //     Description properties
   // 17) Delete all documents in Models created for test in afterAll section 
   
   let JWToken = "";
   let totCount = 0;
   let verificationToken;

   it(" 1) register firstUser -----", async () => {

      let res = await request(server)
         .post("/users/register")
         .send(firstUser);

      console.log(res.body.data.message);

      expect(res.status).toBe(200);
      expect(Mailer.sendEMail).toHaveBeenCalled();
      // find parameter 0 of last call to mock function
      let j = Mailer.sendEMail.mock.calls.length - 1;
      let param = Mailer.sendEMail.mock.calls[j][0];
      //options of sendEMail "to" prop  must be firstUser.email
      expect(param["to"]).toContain(firstUser.email);
      verificationToken = res.body.data.user.verificationToken
   });

   it(" 2) verify EMail  -------", async () => {

      let routeDetail =
         `/users/verify/?token=${verificationToken}&email=${firstUser.email}`;
      //console.log(`Verify : email=${firstUser.email}`);
      let res = await request(server)
         .get(routeDetail);

      console.log( res.body.data.message);

      expect(res.body.status).toBe(200);

   });

   it(" 3) login first user  -----", async () => {
      let res = await request(server)
         .post("/users/login")
         .send({
            email: firstUser.email,
            password: firstUser.password,
         });

      console.log(res.body.data.message);

      expect(res.body.status).toBe(200);
      //console.log(JWToken);
      JWToken = res.body.data.accessToken;
      firstUser.ID = res.body.data.userID;
   });
   
   it(" 4) Create Ten Products for first user  -----", async () => {
      let res;
      for (let i = 0; i < 10; i++) {
         res = await request(server)
            .post("/products/addProduct")
            .set('Authorization', `bearer ${JWToken}`)
            .send({
               productName: "product of "+firstUser.name+" No: "+i.toString(),
               description: " some decription to demonstrate",
            });         
         expect(res.body.status).toBe(200);
         expect(res.body.data.product.userID).toBe(firstUser.ID);
      }
   });

   it(" 5) Delete Two Products for first user  -----", async () => {
      let res;
      for (let i = 0; i < 2;i++) {
         res = await request(server)
            .delete("/products/deleteProduct")
            .set('Authorization', `bearer ${JWToken}`)
            .send({
               productName: "product of " + firstUser.name + " No: " + i.toString(),
            });
         expect(res.body.status).toBe(200);
         expect(res.body.data.product.userID).toBe(firstUser.ID);
      }
   });

   it(" 6) get user products count   ------------", async () => {
      let res = await request(server)
         .post("/products/userProducts/count")
         .set('Authorization', `bearer ${JWToken}`);

      console.log(res.body.data.message);

      expect(res.body.status).toBe(200);
      totCount = +res.body.data.Count;
      expect(totCount).toBe(8);
   });

   it(" 7) get user products list  ------------", async () => {
      let res = await request(server)
         .post("/products/userProducts")
         .set('Authorization', `bearer ${JWToken}`)
         .send({
            page: "1",
            // records in the first page
            size: `${totCount+1}`,
         });

      console.log(res.body.data.message);

      expect(res.body.status).toBe(200);
      //  Products length  returned must be equal to totCount = 8
      expect(res.body.data.products.length).toBe(totCount);
      res.body.data.products.forEach(p => {
         expect(p.productName).toContain(firstUser.name);
         expect(p.description).toContain("demonstrate");
         expect(p.userID).toBe(firstUser.ID);
      });
   });

   it(" 8) register second user  ------------", async () => {
      let res = await request(server)
         .post("/users/register")
         .send(secondUser);

      console.log(res.body.data.message);

      expect(res.status).toBe(200);
      expect(Mailer.sendEMail).toHaveBeenCalled();
      // find parameter 0 of last call to mock function
      let j = Mailer.sendEMail.mock.calls.length - 1;
      param = Mailer.sendEMail.mock.calls[j][0];
      //options of sendEMail "to" prop  must be secondUser.email
      expect(param["to"]).toContain(secondUser.email);
      verificationToken = res.body.data.user.verificationToken;

   });
   it(" 9) verify second EMail   ------------", async () => {   
      routeDetail =
         `/users/verify/?token=${verificationToken}&email=${secondUser.email}`;
      //console.log(`Verify : email=${secondUser.email}`);
      let res = await request(server)
         .get(routeDetail);

      console.log(res.body.data.message);

      expect(res.body.status).toBe(200);
   });

   it(" 10) login second user  ------------", async () => { 
       let res = await request(server)
         .post("/users/login")
         .send({
            email: secondUser.email,
            password: secondUser.password,
         });

      console.log(res.body.data.message);

      expect(res.body.status).toBe(200);
      JWToken = res.body.data.accessToken;
      secondUser.ID = res.body.data.userID;
   });

   it(" 11) Create Ten Products for second user -----", async () => { 
      for (let i = 0; i < 10; i++) {
         let res = await request(server)
            .post("/products/addProduct")
            .set('Authorization', `bearer ${JWToken}`)
            .send({
               productName: "product of " + secondUser.name + " No: " + i.toString(),
               description: " some description to demonstrate",
            });
         expect(res.body.status).toBe(200);
         expect(res.body.data.product.userID).toBe(secondUser.ID);
      }
   });

   it(" 12) Delete Three Products for secon user----", async () => { 
      let res;
      for (let i = 0; i < 3; i++) {
         res = await request(server)
            .delete("/products/deleteProduct")
            .set('Authorization', `bearer ${JWToken}`)
            .send({
               productName: "product of " + secondUser.name + " No: " + i.toString(),
            });
         expect(res.body.status).toBe(200);
         expect(res.body.data.product.userID).toBe(secondUser.ID);
      }
   });

   it(" 13) get user products count  ------------", async () => { 
      let res = await request(server)
         .post("/products/userProducts/count")
         .set('Authorization', `bearer ${JWToken}`);

      console.log( res.body.data.message);

      expect(res.body.status).toBe(200);
      totCount = +res.body.data.Count;
      expect(totCount).toBe(7);
   });

   it(" 14) get user products list   ------------", async () => { 
      res = await request(server)
         .post("/products/userProducts")
         .set('Authorization', `bearer ${JWToken}`)
         .send({
            page: "1",
            // records in the first page
            size: `${totCount + 1}`,
         });

      console.log(res.body.data.message);

      expect(res.body.status).toBe(200);
      //  Products length  returned must be equal to totCount 
      expect(res.body.data.products.length).toBe(totCount);
      res.body.data.products.forEach(p => {
         expect(p.productName).toContain(secondUser.name);
         expect(p.description).toContain("demonstrate");
         expect(p.userID).toBe(secondUser.ID);
      });
   });

   it(" 15) get all products count   ------------", async () => { 
      let res = await request(server)
         .post("/products/allProducts/count")
         .set('Authorization', `bearer ${JWToken}`);

      console.log(res.body.data.message);

      expect(res.body.status).toBe(200);
      totCount = +res.body.data.Count;
      expect(totCount).toBe(15);

   });

   it(" 16) get all products list   ------------", async () => { 
      let res = await request(server)
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
         expect(p.productName).toContain("product");
         expect(p.description).toContain("demonstrate");
         expect(p).toHaveProperty("userID");
      });

   })
});
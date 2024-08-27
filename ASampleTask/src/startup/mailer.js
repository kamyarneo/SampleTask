
const nodeMailer = require('nodemailer');

// singletone Class. it was not designed to instansciate
// use Mailer statically and globally
// initializing multiple time has no side effects
 class  Mailer {
   static transporter = null;
   static initialize() {
      if (Mailer.transporter === null) { 
         Mailer.transporter =  nodeMailer.createTransport({
           service: "gmail",
           //secure: false,
            auth: {
               // please set a valid email@gmail.com with gmail
               // app password for nodemailer
              user: "kamyar.jazayeri@gmail.com",
              pass: "",
           },
         });
         
      } 
      return ;
   } 
   
   static async sendEMail(mailOptions) {
     return  await Mailer.transporter.sendMail(mailOptions); 
   }
}
module.exports = Mailer;





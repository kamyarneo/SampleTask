const bcrypt = require("bcryptjs");
const crypto = require('crypto');

const  validateHash = async function (password, hashPassword) {
   return  bcrypt.
      compare(password, hashPassword);
}
const getHashOf = async function (password) {
   return bcrypt.hash(password, 10);
}
module.exports = {getHashOf, validateHash}
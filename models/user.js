var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var userScheme = new mongoose.Schema({
  username:String,
  password:String,
  name:String,
  mobno:String,
  bitsid:String,
  flag:String
});
userScheme.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",userScheme);

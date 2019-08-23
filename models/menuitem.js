var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var menuitemScheme = new mongoose.Schema({
  name:String,
  outletname:String,
  outlet:{
     type:mongoose.Schema.Types.ObjectId,
     ref:"Outlet"
  },
  category:String,
  price:Number,
  nov:String
});
module.exports = mongoose.model("MenuItem",menuitemScheme);

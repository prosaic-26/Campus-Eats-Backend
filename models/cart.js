var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var cartScheme = new mongoose.Schema({
  username:String,
  items:[{
     type:mongoose.Schema.Types.ObjectId,
     ref:"MenuItem"
  }],
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
});
module.exports = mongoose.model("Cart",cartScheme);

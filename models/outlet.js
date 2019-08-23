var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var outletScheme = new mongoose.Schema({
  name:String,
  location:String,
  rating:Number,
  description:String,
  owner:{
     type:mongoose.Schema.Types.ObjectId,
     ref:"User"
  },
  menu:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"MenuItem"
  }],
  user:String,
  image:String
});
module.exports = mongoose.model("Outlet",outletScheme);

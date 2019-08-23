var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var reviewScheme = new mongoose.Schema({
  studentname:String,
  outletname:String,
  content:String,
  student:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  outlet:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Outlet"
  }
});

module.exports = mongoose.model("Review",reviewScheme);

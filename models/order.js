var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var orderScheme = new mongoose.Schema({
  studentname:String,
  outletname:String,
  orderdate:Number,
  totalcost:Number,
  status:String,
  items:[{
     type:mongoose.Schema.Types.ObjectId,
     ref:"MenuItem"
    }],
  quantity:[Number],
  student:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  outlet:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Outlet"
  }
});

module.exports = mongoose.model("Order",orderScheme);

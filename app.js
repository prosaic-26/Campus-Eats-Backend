var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var cors=require("cors");
var mongoose = require("mongoose");
var passport = require("passport");
var localStrategy = require("passport-local");
const multer = require('multer');
var User = require("./models/user");
var Outlet = require("./models/outlet");
var MenuItem = require("./models/menuitem");
var Cart = require("./models/cart");
var Order = require("./models/order");
var Review = require("./models/review");
var dbkey = require("./dbkey");
const path = require('path');
const port = process.env.PORT || 3050;
process.env.MONGO_URL="mongodb://campuseats:campuseats@cluster0-shard-00-00-kkpdt.mongodb.net:27017,cluster0-shard-00-01-kkpdt.mongodb.net:27017,cluster0-shard-00-02-kkpdt.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true"

/*
//Static file declaration
app.use(express.static(path.join(__dirname, 'client/build')));

//production mode
if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  //
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname,'client','build','index.html'));
  })
}
else{
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/public/index.html'));
})
}*/

mongoose.connect(process.env.MONGO_URL,{ useNewUrlParser: true });
app.use(require("express-session")({
  secret:"secret",
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(User.deserializeUser());
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static('public'));
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        cb(null,file.originalname)
    }
});
const upload = multer({
    storage
});

app.listen(process.env.PORT||3050,function(){
  console.log(`listeneing on port ${process.env.PORT}`);
});
app.get("/",function(req,res){
  var todos=["Hiii","Byee","Good night"];
  console.log(todos);
  console.log(req.user);
  res.send({todos:todos,user:req.user});
  //res.render("index.ejs");
});
app.post("/signup",function(req,res){
  User.register(new User({username:req.body.username}),req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.send({status:false,error:err});
    }else {
      user.flag="student";
      user.mobno=req.body.mobno;
      user.name=req.body.name;
      user.bitsid=req.body.bitsid;
      user.save();
      passport.authenticate("local")(req,res,function(){
        res.send({status:true,user:user});
        //res.redirect("/")
      });
    }
  });
});
app.post("/createoutletacc",function(req,res){
  User.register(new User({username:req.body.username}),req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.send({status:false,error:err})
    }else {
      user.flag="outlet";
      user.mobno=req.body.mobno;
      user.name=req.body.name;
    //  user.bitsid=req.body.bitsid;
      user.save();
      passport.authenticate("local")(req,res,function(){
        res.send({user:user,status:true});
        //res.redirect("/")
      });
    }
  });
});
app.post("/createoutlet",function(req,res){
  var owner={id:req.body.user.id,username:req.body.user.username}
  Outlet.create({name:req.body.name},function(err,out){
    if(err){
      console.log("error");
    }else {
      out.location=req.body.location;
      out.description=req.body.description;
      out.owner=req.body.user._id;
      out.user=req.body.user.username;
      out.image=req.body.image;
      out.save();
      res.send({outlet:out});
    }
  });
});
app.post("/createcart",function(req,res){
  Cart.create({username:req.body.user.username},function(err,cart){
    if(err){
      console.log(err);
      res.send({status:false,error:err});
    }else {
      cart.user=req.body.user._id;
      cart.save();
      res.send({status:true,cart:cart});
    }
  });
});
app.post("/addtocart",function(req,res){
  Cart.findOne({username:req.body.user.username},function(err,cart){
    if(err){
      console.log(err);
      res.send({status:false,error:err});
    }else {
      var status=true;
      cart.items.forEach(function(item){
        if(item._id==req.body.item._id){
          status=false
        }
      });
      if(status==true){
      cart.items.push(req.body.item);
      cart.save();
      res.send({cart:cart});
    }else{
      res.send({status:false,message:"Item already exists in your cart"});
    }
  }
  })
});
app.post("/viewcart",function(req,res){
  Cart.findOne({username:req.body.user.username}).populate("items").exec(function(err,cart){
     if(err){
       res.send({status:false,error:err});
     }else {
       res.send({status:true,cart:cart});
     }
  });
});
app.post("/removecartitem",function(req,res){
  Cart.findOne({username:req.body.user.username},function(err,cart){
    if(err){
      res.send({status:false,error:err});
    }else {
      cart.items.splice(req.body.index,1);
      cart.save();
      res.send({status:true,cart:cart});
    }
  })
})
app.post("/placeorder",function(req,res){
  var items = req.body.items;
  var quantity = req.body.quantity;
  var oids = [];
  for(var i=0;i<items.length;i++)
    if(oids.indexOf(items[i].outlet)==-1)
      oids.push(items[i].outlet);
  oids.forEach(function(oid){
    Outlet.findById(oid,function(err,outlet){
      if(err){
        res.send({status:false,error:err});
      }else {
        Order.create({studentname:req.body.user.username,outletname:outlet.name},function(err,order){
          if(err){
            res.send({status:false,error:err});
          }else {
            order.outlet=outlet._id;
            order.student=req.body.user._id;
            order.status = "received";
            var d = new Date();
            order.orderdate = d.getTime();
            var sum=0;
            for(var i=0;i<items.length;i++)
              if(items[i].outlet==oid){
                order.items.push(items[i]._id);
                order.quantity.push(quantity[i]);
                sum=sum+items[i].price*quantity[i];
              }
            order.totalcost = sum;
            order.save();
          }
        });
      }
    });
  });
  Cart.findOne({username:req.body.user.username}).populate("items").exec(function(err,cart){
     if(err){
       res.send({status:false,error:err});
     }else {
       cart.items=[];
       cart.save();
       res.send({status:true,cart:cart});
     }
  });
});
app.post("/cstatus",function(req,res){
  console.log("Hiiii");
  console.log("Hiiii");
  console.log("Hiiii");
  console.log("Hiiii");
  console.log("Hiiii");
  console.log(req.body.order._id);
  console.log("Hiiii");
  console.log("Hiiii");

  Order.findById(req.body.order._id,function(err,order){
    if(err){
      res.send({status:false,error:err});
    }else {
      order.status=req.body.status;
      order.save();
      console.log(order);
      res.send({status:true});
      /*
      app.post('/getcourse',function(req,res){
        Course.findOne({coursename:req.body.coursename},function(err,course){
              res.send({course:course});
        });
    })



      */
    }
  })
})
app.post("/getstudentorders",function(req,res){
  Order.find({studentname:req.body.user.username}).populate("items").populate("student").populate("outlet").exec(function(err,orders){
    if(err){
      res.send({status:false,error:err});
    }else {
      var uporders = []
      orders.forEach(function(order){
        if(order.status != "delivered")
          uporders.push(order);
      });
      res.send({status:true,orders:uporders});
    }
  });
});
app.post("/stuhistory",function(req,res){
  Order.find({studentname:req.body.user.username,status:"delivered"}).populate("items").populate("outlet").exec(function(err,orders){
    if(err){
      res.send({status:false,error:err});
    }else {
      res.send({status:true,orders:orders});
    }
  })
})
app.post("/getoutletorders",function(req,res){
  Order.find({outletname:req.body.outlet.name}).populate("items").populate("student").populate("outlet").exec(function(err,orders){
    if(err){
      res.send({status:false,error:err});
    }else {
      var uporders = []
      orders.forEach(function(order){
        if(order.status != "delivered")
          uporders.push(order);
      });
      res.send({status:true,orders:uporders});
    }
  });
})
app.post("/login",passport.authenticate("local",{failureRedirect:"/loginfail"}),function(req,res){
  console.log("user logged in");
  console.log(req.user.flag);
  var user = req.user;
  var status=false
  if(user!=null)
    status=true;
  res.send({user:user,status:status});
//res.redirect("/");
});
app.get("/loginfail",function(req,res){
  res.send({status:false});
});
app.get("/logout",function(req,res){
  req.logout();
  //res.redirect("/");
});
app.post("/myoutlet",function(req,res){
  Outlet.findOne({user:req.body.user}).populate("owner").populate("menu").exec(function(err,outlet){
    if(err){
      console.log(err);
    }else {
      console.log(outlet);
      console.log(req.body.user)
      res.send({outlet:outlet});
    }
  });
});
app.get("/trial",function(req,res){
  res.send({message:"I'm Awesome"});
});
app.post("/outlets",function(req,res){
  Outlet.find({}).populate("owner").populate("menu").exec(function(err,outlets){
    if(err){
      res.send({status:false,error:err});
    }else {
      console.log(outlets);
      res.send({status:true,outlets:outlets});
    }
  });
});
app.post("/addmenu",function(req,res){
    Outlet.findById(req.body.outlet._id).populate("menu").exec(function(err,outlet){
      if(err){
        res.send({staus:false,error:err});
      }else {
        var p=0
        for(var i=0;i<outlet.menu.length;i++)
          if(req.body.name == outlet.menu[i].name)
            p=1;
        if(p==1){
          res.send({status:false});
        }else {
          MenuItem.create({name:req.body.name,outlet:outlet._id},function(err,menuitem){
            if(err){
              res.send({status:false,error:err});
            }else {

              menuitem.price=req.body.price;
              menuitem.category=req.body.category;
              menuitem.nov=req.body.nov;
              menuitem.outletname=req.body.outlet.name;
              menuitem.save();
              outlet.menu.push(menuitem);
              outlet.save();
              res.send({outlet:outlet});
            }
          });
        }

      }
    });
});
app.post("/deletemenu",function(req,res){
    Outlet.findById(req.body.outlet._id,function(err,outlet){
      if(err){
        res.send({staus:false,error:err});
      }else {
         var i = outlet.menu.indexOf(req.body.menuId);
         outlet.menu.splice(i,1);
         outlet.save();
         res.send({status:true});
      }

    })
})
app.post("/postreview",function(req,res){
  Review.create({studentname:req.body.user.username,outletname:req.body.outlet.name},function(err,review){
    if(err){
      res.send({status:false,error:err});
    }else{
      review.student=req.body.user._id;
      review.outlet=req.body.outlet._id;
      review.content=req.body.content;
      review.save();
      res.send({status:true});
    }
  });
});
app.post("/getreviews",function(req,res){
  Review.find({outlet:req.body.outlet._id}).populate("student").exec(function(err,reviews){
    if(err){
      res.send({status:false,error:err});
    }else {
      res.send({status:true,reviews:reviews});
    }
  })
});

app.post("/stats",function(req,res){
  var s,o,r;
  Order.find({},function(err,orders){
    if(err){
      res.send({status:false,error:err});
    }else {
        o=orders.length;
        s=0;
        for(var i=0;i<orders.length;i++)
          s=s+orders[i].totalcost;
        Review.find({},function(err,reviews){
          if(err){
            res.send({status:false,error:err});
          }else {
            r=reviews.length;
            res.send({onum:o,snum:s,rnum:r});
          }
        })
    }
  })
})
app.post("/chartstats",function(req,res){
  var ots=[];
  var series=[];
  var s2=[];
  Order.find({},function(err,orders){
    if(err){
      res.send({status:false,error:err});
    }else {
      for(var i=0;i<orders.length;i++)
        if(ots.indexOf(orders[i].outletname)==-1)
           ots.push(orders[i].outletname);
      ots.forEach(function(o){
        var s=0;
        var c=0;
        for(var i=0;i<orders.length;i++)
          if(orders[i].outletname==o){
             s=s+orders[i].totalcost;
             c=c+1;
           }
        series.push(s);
        s2.push(c);
      });
      res.send({ots:ots,series:series,s2:s2});
    }
  });
});
app.post('/upload', upload.single('image'), (req, res) => {
    if (req.file)
        res.json({
            imageUrl: `images/${req.file.filename}`
        });
    else
        res.status("409").json("No Files to Upload.");
});

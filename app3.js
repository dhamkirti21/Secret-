//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session')
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


app.use(session({
    secret:"thisisacrowsoup!",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
   email:String,
   password:String
})

userSchema.plugin(passportLocalMongoose);
// const secret = "Thisisourlittlesecret.";

const User = new mongoose.model("user",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
  res.render('home')
})

app.route("/login")

.get((req, res) => {
  res.render('login')
})

.post(function(req,res){
    const user = new User({
      username:req.body.username,
      password:req.body.password
    });
    req.login(user,function(err){
      if(err){
        console.log(err);
      }
      else{
        passport.authenticate("local");
        res.redirect("/secrets");
      }
    })
});

app.get("/secrets",function(req,res){
    
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else{
    res.redirect("/login");
  }
});

app.get("/logout", function(req,res){
  req.logout((err)=>{
    if(err){
      console.log(err);
    }
  });
  res.redirect("/");
});

app.route("/register")

.get(function(req,res){
   res.render("register")
})

.post(function(req,res){
   User.register({username:req.body.username},req.body.password,(err,user)=>{
     if(err){
      console.log(err);
      res.redirect("/register");
     }
     else{
        passport.authenticate("local")(req,res,function(){
          res.redirect("/secrets");
        })
     }
   })
  
});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
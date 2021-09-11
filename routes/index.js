var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var game = require("../models/game");


router.get("/register", function(req, res) {
    res.render("register");
});

router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
                            avatar: req.body.avatar
                        });
    
    User.register(newUser, req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            res.redirect('/register');
        }
        else {
            passport.authenticate("local")(req, res, function() {
            req.flash("success","Welcome to Gamers Blogs, " + user.username);
            res.redirect("/games");
            });
        }
    });
});

router.get("/", function(req, res) {
    res.render("landing");
});


router.get("/login", function(req, res) {
    res.render("login");
});

router.post("/login", passport.authenticate("local", {
    successRedirect: "/games",
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res) {});


router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged Out!");
    res.redirect("/games");
});

router.get("/users/:id", function(req, res) {
   User.findById(req.params.id, function(err, foundUser){
      if(err){
          req.flash("error", "Something went wrong");
          res.redirect("/games");
      } else {
          game.find({ 'author.id' : foundUser._id }).exec(function(err, gameFound){
              if(err) {
                  req.flash("error", "Something went wrong...");
                  res.redirect("/games");
              } else {
                  res.render("users/show", {user: foundUser, games: gameFound});
              }
          })
      }
   }); 
});



module.exports = router;

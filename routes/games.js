var express = require("express");
var router = express.Router();
var game = require("../models/game");
var middleware = require("../middleware")

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

var imageFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'cloudinaryneon', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


router.get("/", function(req, res) {
    if(req.query.search) {
        
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
         //Get all games fro the DB
        game.find({"name": regex}, function(err, allgames) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("games/index", { games: allgames });
            }
        });
    } else {
        //Get all games fro the DB
        game.find({}, function(err, allgames) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("games/index", { games: allgames });
            }
        });
    }
});

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
      req.body.game.image = result.secure_url;
      req.body.game.author = {
        id: req.user._id,
        username: req.user.username
      }
      game.create(req.body.game, function(err, game) {
        if (err || !game) {
          req.flash('error', err.message);
          return res.redirect('/games');
        }
        res.redirect('/games/' + game.id);
      });
    });
});


router.get("/new",middleware.isLoggedIn, function(req, res) {
    res.render("games/new");
});


router.get("/:id", function(req, res) {
    game.findById(req.params.id).populate("comments").exec(function(err, foundgame) {
        if (err || !foundgame) {
            req.flash("error","Something went wrong.");
            res.redirect("/games");
        }
        else {
            res.render("games/show", { game: foundgame });
        }
    });
});


router.get("/:id/edit", middleware.checkgameOwnership, function(req, res) {
    game.findById(req.params.id, function(err, foundgame ) {
        if (err || !foundgame) {
             req.flash("error","Something went wrong.");
             res.redirect("/games");
        } else {
            res.render("games/edit",  { game: foundgame }); 
        }
    
    });
});

router.put("/:id", middleware.checkgameOwnership, upload.single('image'), function(req, res) {
    if(req.file){
        cloudinary.uploader.upload(req.file.path, function(result) {
          
          req.body.game.image = result.secure_url;
          req.body.game.body = req.sanitize(req.body.game.body);
          game.findByIdAndUpdate(req.params.id, req.body.game, function(err, updatedgame) {
                if (err || !updatedgame) {
                    res.redirect("/games");
                }
                else {
                    req.flash("success","post successfully updated.");
                    res.redirect("/games/" + req.params.id);
        
                }
            });
    
        });

    } else {
        req.body.game.body = req.sanitize(req.body.game.body);
        game.findByIdAndUpdate(req.params.id, req.body.game, function(err, updatedgame) {
            if (err || !updatedgame) {
                res.redirect("/games");
            }
            else {
                req.flash("success","post successfully updated.");
                res.redirect("/games/" + req.params.id);
    
            }
        });
    }
});

router.delete("/:id", middleware.checkgameOwnership, function(req, res) {
    game.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/games");

        }
        else {
            req.flash("success","post successfully deleted.");
            res.redirect("/games");

        }
    });
});

module.exports = router;





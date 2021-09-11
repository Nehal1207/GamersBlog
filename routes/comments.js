var express = require("express");
var router = express.Router({ mergeParams: true });
var Comment = require("../models/comment");
var game = require("../models/game");
var middleware = require("../middleware")
var moment = require("moment")

router.get("/new", middleware.isLoggedIn, function (req, res) {

    game.findById(req.params.id, function(err, game) {
        if (err || !game) {
            req.flash("error","Something went wrong.");
            return res.redirect("/games");
        }
        else {
            res.render("comments/new", { game: game });
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res) {
    game.findById(req.params.id, function(err, foundgame) {
        if (err || !foundgame) {
            req.flash("error","Something went wrong.");
            return res.redirect("/games");
        }
        else {
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    console.log(err);
                }
                else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.author.dateAdded = moment(Date.now()).format("DD/MM/YYYY");
                     comment.save();
                    foundgame.comments.push(comment._id);
                    foundgame.save();
                    req.flash("success","Comment successfully added.");
                    res.redirect('/games/' + foundgame._id);
                }
            });
        }
    });
});

//Comment edit route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    game.findById(req.params.id, function(err, foundgame) {
        if(err || !foundgame){
            req.flash("error", "Error has occured")
            return res.redirect("/games");
        }
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                req.flash("error","Something went wrong.");
                res.redirect("/games");
            } else {
              res.render("comments/edit", {game_id: req.params.id, comment: foundComment}); 
            }
        });
    })
    
});

//comment update route
router.put("/:comment_id", function(req, res) {
    //find comment ID in DB
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            req.flash("error","Something went wrong.");
            res.redirect("back");
        }
        else {
            req.flash("success","Comment successfully updated.");
            res.redirect("/games/" + req.params.id);
        }
    });
});

//comment destroy route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //find Comment ID in DB
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            req.flash("error","Something went wrong.");
            res.redirect("/games");

        }
        else {
            req.flash("success","Comment deleted.");
            res.redirect("/games/" + req.params.id);

        }
    });
});




module.exports = router;

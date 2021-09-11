const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");

const User = require("./models/user");

const app = express();

require('dotenv').config();

const commentRoutes = require("./routes/comments");
const gameRoutes = require("./routes/games");
const indexRoutes = require("./routes/index");

var url = process.env.DATA_URL || "mongo://local_data";
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(cookieParser('secret'));



app.use(require("express-session")({
    secret: "yennb",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


app.use(indexRoutes);
app.use("/games", gameRoutes);
app.use("/games/:id/comments", commentRoutes);

app.listen(process.env.PORT, function () {
    console.log(`Gamers Blogs App Server has Started on ${process.env.PORT}!!!`);
});

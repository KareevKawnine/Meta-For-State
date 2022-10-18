if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const qs = require("qs");
const request = require("request");
const bodyParser = require("body-parser");
//parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// parse application/json
app.use(bodyParser.json());

app.use(express.static(__dirname + "/public"));
const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

const users = [];
app.set("view-engine", "ejs");
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.get("/", checkNotAuthenticated, (req, res) => {
  res.render("index.ejs");
});

app.get("/project", (req, res) => {
  res.render("project.ejs");
});

app.get("/tos", (req, res) => {
  res.render("tos.ejs");
});
app.get("/platform-status", (req, res) => {
  res.render("platform-status.ejs");
});
app.get("/help-center", (req, res) => {
  res.render("help-center.ejs");
});

app.get("/home", checkAuthenticated, (req, res) => {
  res.render("home.ejs", {
    name: req.user.name,
    email: req.user.email,
  });
});

app.get("/edit-profile", checkAuthenticated, (req, res) => {
  res.render("edit-profile.ejs", {
    name: req.user.name,
    email: req.user.email,
    password: req.user.password,
  });
});
app.get("/manage-project", checkAuthenticated, (req, res) => {
  res.render("manage-project.ejs", {
    name: req.user.name,
    email: req.user.email,
    password: req.user.password,
  });
});

//Authentication stuffs
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});
app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
});

app.delete("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(3000, () => {
  console.log("We are on LIVE KIDDO");
});

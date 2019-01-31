"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');

// Seperated Routes for each Resource
const crustRoutes = require("./routes/crust");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/crust", crustRoutes(knex));

// Home page
app.get("/", (req, res) => {

  Promise.all([
    new Promise(function(resolve, reject) {
      knex
        .select()
        .from("size")
        .then((results) => {
          resolve(results);
      });
    }),

    new Promise(function(resolve, reject) {
      knex
        .select()
        .from("crust")
        .then((results) => {
          resolve(results);
      });
    }),

    new Promise(function(resolve, reject) {
      knex
        .select()
        .from("topping")
        .then((results) => {
          resolve(results);
      });
    }),

    new Promise(function(resolve, reject) {
      knex
        .select()
        .from("extra")
        .then((results) => {
          resolve(results);
      });
    })
  ]).then(function(values) {

    const sizes = values[0];
    const crusts = values[1];
    const toppings = values[2];
    const extras = values[3];

    let templateVars = {
      sizes: sizes,
      crusts: crusts,
      toppings: toppings,
      extras: extras
    };

    res.render("index", templateVars);
  });
});

// Restaurant page
app.get("/restaurant", (req, res) => {
  let templateVars = {};
  res.render('restaurant');
});

// Customer page
app.get("/:id", (req, res) => {
  req.cookies
  let templateVars = {};
  res.render('confirmation');
});


app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});

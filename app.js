var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var dotEnv = require("dotenv");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var taskRouter = require("./routes/taskRoutes");
var callToDatabase = require("./db/database-connection");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
require("dotenv").config();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
dotEnv.config();
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/tasks", taskRouter);

callToDatabase().then(() => {
  console.log("connected to port " + process.env.PORT);
});
module.exports = app;

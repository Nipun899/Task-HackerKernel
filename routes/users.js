var express = require("express");
const { route } = require(".");
const {
  createUser,
  loginUser,
  getUserByIdWithTasks,
} = require("../controllers/userControllers");
var router = express.Router();

/* GET users listing. */
router.post("/createUser", createUser);
router.post("/login", loginUser);
router.get("/:id", getUserByIdWithTasks);
module.exports = router;

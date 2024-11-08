const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskControllers");
const authenticate = require("../middlewares/authenticate");

// Create a new task
router.post("/createTasks", authenticate, taskController.createTask);

// Update task status (pending to done)
router.put("/updateTask/:taskId", taskController.updateTaskStatus);

// Add users to a task
router.put("/:taskId/users", taskController.addUsersToTask);

// Fetch all users with their tasks
router.get("/users/tasks", taskController.getUsersWithTasks);

module.exports = router;

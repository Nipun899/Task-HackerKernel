var express = require("express");
var router = express.Router();
const ExcelJS = require("exceljs");
const Task = require("../models/taskModel");
const User = require("../models/userModels");
const isAuthenticated = require("../middlewares/authenticate");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index");
});

//frontend route to create a user
router.get("/createUser", (req, res) => {
  res.render("addUser");
});

// Profile route to render user data in profile.ejs
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("tasks");
    res.render("profile", { user });
  } catch (error) {
    console.error("Error fetching user data for profile:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

// route to export all the details to the  excel sheet
router.get("/export", async (req, res) => {
  try {
    // Populate the tasks field with the necessary task details like title and status
    const users = await User.find().populate("tasks", "title status");
    const tasks = await Task.find().populate("assignedTo", "name email");

    const workbook = new ExcelJS.Workbook();
    const userSheet = workbook.addWorksheet("User");
    const taskSheet = workbook.addWorksheet("Task");

    // User sheet columns
    userSheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Mobile", key: "mobile", width: 15 },
      { header: "ID", key: "id", width: 30 },
      { header: "Task Assigned", key: "tasks", width: 30 },
    ];

    // Add data for User sheet
    users.forEach((user) => {
      // You can access the populated tasks now
      const taskNames = user.tasks.map((task) => task.title).join(", ");
      userSheet.addRow({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        id: user._id,
        tasks: taskNames, // Here you add the task titles to the user row
      });
    });

    // Task sheet columns
    taskSheet.columns = [
      { header: "Task Name", key: "taskName", width: 30 },
      { header: "Task Type", key: "taskType", width: 15 },
      { header: "Assigned User", key: "assignedTo", width: 30 },
      { header: "Task ID", key: "id", width: 30 },
    ];

    // Add data for Task sheet
    tasks.forEach((task) => {
      taskSheet.addRow({
        taskName: task.title,
        taskType: task.status,
        assignedTo: task.assignedTo.map((user) => user.name).join(", "),
        id: task._id,
      });
    });

    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Set response headers to indicate file download
    res.setHeader("Content-Disposition", "attachment; filename=export.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.status(200).send(buffer); // Send the buffer as the response
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

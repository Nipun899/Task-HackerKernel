const Task = require("../models/taskModel");
const User = require("../models/userModels");

// 1. Create a task
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;
    const { userId } = req.user;

    if (!title || !description || !assignedTo || assignedTo.length === 0) {
      return res
        .status(400)
        .json({ error: "Title, description, and users are required" });
    }

    // Create a new task
    const newTask = new Task({
      title,
      description,
      assignedTo,
      createdBy: userId, // User who created the task
    });

    await newTask.save();

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while creating the task",
      message: error.message,
    });
  }
};

// 2. Update task status (from pending to done)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    // Find task by ID and update its status
    const updatedTask = await Task.findByIdAndUpdate(taskId, {
      status: "done",
    });

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({
      message: "Task status updated successfully",
      updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while updating the task",
      message: error.message,
    });
  }
};

// 3. Add users to a task
exports.addUsersToTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { users } = req.body; // Array of user IDs to add to the task

    if (!users || users.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one user ID is required" });
    }

    // Find the task and add users to the assignedTo array
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Add the users to the assignedTo field in the task
    task.assignedTo.push(...users);

    // Save the task
    await task.save();

    // Now, update the user's tasks array to include the task ID for each user
    for (let userId of users) {
      const user = await User.findById(userId);
      if (user) {
        // Add the task to the user's tasks array
        user.tasks.push(taskId);
        await user.save(); // Save the updated user
      }
    }

    res.status(200).json({
      message: "Users added to the task successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while adding users to the task",
      message: error.message,
    });
  }
};

// 4. Fetch all users and their specific tasks
exports.getUsersWithTasks = async (req, res) => {
  try {
    // Populate the tasks assigned to each user
    const users = await User.find().populate({
      path: "tasks",
      model: "Task",
    });

    res.status(200).json({
      message: "Users and their tasks fetched successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while fetching users and their tasks",
      message: error.message,
      details: error.errors,
    });
  }
};

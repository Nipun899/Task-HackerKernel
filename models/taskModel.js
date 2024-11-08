const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "done"],
    default: "pending",
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model, assigning this task to multiple users
    required: true,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model, indicating who created the task
    required: true,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt timestamps
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;

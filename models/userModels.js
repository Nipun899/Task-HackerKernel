const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^[a-zA-Z\s]{2,}$/,
        "Name must contain only letters and spaces, and be at least 2 characters long",
      ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{10}$/, "Mobile number must be exactly 10 digits"],
    },
    password: {
      type: String,
      required: true,
      // No match validator here since we're validating in the pre-save hook
    },
    passwordFormat: {
      type: String,
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ],
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        default: [], // Set default value as an empty array
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to validate and hash the password
userSchema.pre("save", async function (next) {
  const user = this;

  // Check if password is being created or modified
  if (user.isModified("password")) {
    // Validate password format using `passwordFormat`
    user.passwordFormat = user.password;

    // Hash the password
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);

    // Remove `passwordFormat` before saving to database
    user.passwordFormat = undefined;
  }

  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;

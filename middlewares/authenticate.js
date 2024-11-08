// middleware/authenticate.js
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  // Retrieve token from cookies
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify token and attach user data to req.user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;

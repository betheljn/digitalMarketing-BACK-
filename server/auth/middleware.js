const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateUser(req, res, next) {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Assuming your JWT payload includes user details such as `id`
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(403).send("Invalid token.");
  }
}

const authorizeUser = (allowedRoles) => {
    return (req, res, next) => {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      // Check if user's role is included in allowedRoles
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
  
      // User is authorized, call next middleware
      next();
    };
  };

module.exports = {
  authenticateUser,
  authorizeUser,
};
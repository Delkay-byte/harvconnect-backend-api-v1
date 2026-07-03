// src/middleware/role.middleware.js
const AppError = require("../utils/AppError");

// Usage: authorize('FARMER', 'BUYER')
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};

module.exports = authorize;

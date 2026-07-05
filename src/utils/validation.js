const { validationResult } = require("express-validator");

/**
 * Shared validation error handler middleware
 * Checks for validation errors and returns a standardized error response
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};

module.exports = { handleValidationErrors };

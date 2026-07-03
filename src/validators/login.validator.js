// src/validators/login.validator.js
const { body, validationResult } = require("express-validator");

const validateLogin = [
  // We allow phone for now as it's the primary identifier
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateLogin };

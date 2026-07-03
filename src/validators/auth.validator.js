// src/validators/auth.validator.js
const { body, validationResult } = require("express-validator");
const ROLES = require("../constants/roles");

const validateRegister = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").trim().notEmpty().withMessage("Phone is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Must contain a lowercase letter")
    .matches(/\d/)
    .withMessage("Must contain a number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Must contain a special character"),

  body("role")
    .isIn([ROLES.FARMER, ROLES.BUYER, ROLES.TRANSPORT])
    .withMessage("Invalid role"),

  body("vehicleType")
    .if(body("role").equals(ROLES.TRANSPORT))
    .notEmpty()
    .withMessage("Vehicle type is required for transport providers.")
    .isIn(["MOTORBIKE", "TRICYCLE", "PICKUP", "MINI_TRUCK", "TRUCK", "OTHER"])
    .withMessage("Invalid vehicle type."),

  body("capacity")
    .if(body("role").equals(ROLES.TRANSPORT))
    .notEmpty()
    .withMessage("Capacity is required for transport providers.")
    .isFloat({ min: 1 })
    .withMessage("Capacity must be a positive number."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required."),
  body("password").notEmpty().withMessage("Password is required."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateRegister, validateLogin };

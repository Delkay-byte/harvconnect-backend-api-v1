// src/validators/recommendation.validator.js
const { query, validationResult } = require("express-validator");
const commodities = require("../constants/commodities");

const validateCommodity = [
  // I am checking the query params here, not the body, since it's a GET request
  query("commodity")
    .notEmpty()
    .withMessage("Commodity is required.")
    .isIn(commodities)
    .withMessage("Invalid commodity selected."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
    }
    next();
  },
];

module.exports = { validateCommodity };

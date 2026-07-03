// src/validators/product.validator.js
const { body, validationResult } = require("express-validator");
const COMMODITIES = require("../constants/commodities");
const UNITS = require("../constants/units");

const validateCreateProduct = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters."),

  body("description")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),

  body("price")
    .isFloat({ min: 0.1 })
    .withMessage("Price must be a positive number.")
    .toFloat(),

  body("quantity")
    .isFloat({ min: 0.1 })
    .withMessage("Quantity must be a positive number.")
    .toFloat(),

  body("unit")
    .trim()
    .customSanitizer((value) =>
      typeof value === "string" ? value.toUpperCase() : value,
    ) // Automatically fix casing anomalies
    .isIn(UNITS)
    .withMessage(`Invalid unit. Allowed values: ${UNITS.join(", ")}`),

  body("category")
    .trim()
    .customSanitizer((value) =>
      typeof value === "string" ? value.toUpperCase() : value,
    ) // Ensure it matches the strict database Enum
    .isIn(Object.values(COMMODITIES))
    .withMessage("Invalid commodity category selection."),

  body("harvestDate")
    .optional()
    .isISO8601()
    .withMessage("Harvest date must be a valid ISO8601 timestamp."),

  body("imageUrl")
    .optional()
    .isURL()
    .withMessage("Image link must be a valid URL string."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

const validateUpdateProduct = [
  body("name").optional().trim().isLength({ min: 2, max: 100 }),
  body("description").optional().isString().trim().isLength({ max: 500 }),
  body("price").optional().isFloat({ min: 0.1 }).toFloat(),
  body("quantity").optional().isFloat({ min: 0.1 }).toFloat(),
  body("unit")
    .optional()
    .trim()
    .customSanitizer((value) =>
      typeof value === "string" ? value.toUpperCase() : value,
    )
    .isIn(UNITS),
  body("category")
    .optional()
    .trim()
    .customSanitizer((value) =>
      typeof value === "string" ? value.toUpperCase() : value,
    )
    .isIn(Object.values(COMMODITIES)),
  body("harvestDate").optional().isISO8601(),
  body("imageUrl").optional().isURL(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateCreateProduct, validateUpdateProduct };

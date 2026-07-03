const { body, validationResult } = require("express-validator");

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

const validateFarmerProfile = [
  body("farmName")
    .optional()
    .trim()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage("Farm name must be between 2 and 100 characters."),

  body("bio")
    .optional()
    .trim()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters."),

  body("address")
    .optional()
    .trim()
    .isString()
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters."),

  body("latitude")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid coordinate between -90 and 90.")
    .toFloat(),

  body("longitude")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid coordinate between -180 and 180.")
    .toFloat(),

  handleValidationErrors,
];

const validateBuyerProfile = [
  body("deliveryAddress")
    .optional()
    .trim()
    .isString()
    .isLength({ max: 200 })
    .withMessage("Delivery address cannot exceed 200 characters."),

  body("latitude")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid coordinate between -90 and 90.")
    .toFloat(),

  body("longitude")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid coordinate between -180 and 180.")
    .toFloat(),

  handleValidationErrors,
];

module.exports = {
  validateFarmerProfile,
  validateBuyerProfile,
};

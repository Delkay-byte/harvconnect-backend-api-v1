const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
  updateFarmerProfile,
  updateBuyerProfile,
} = require("../controllers/profileController");

const {
  validateFarmerProfile,
  validateBuyerProfile,
} = require("../validators/profile.validator");

const router = express.Router();

router.use(authMiddleware);

router.patch(
  "/farmer",
  authorize("FARMER"),
  validateFarmerProfile,
  updateFarmerProfile,
);

router.patch(
  "/buyer",
  authorize("BUYER"),
  validateBuyerProfile,
  updateBuyerProfile,
);

module.exports = router;

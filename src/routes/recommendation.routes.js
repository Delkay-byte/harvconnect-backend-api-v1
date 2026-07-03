// src/routes/recommendation.routes.js
const express = require("express");
const {
  getRecommendationsController,
} = require("../controllers/recommendationController");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { validateCommodity } = require("../validators/recommendation.validator");

const router = express.Router();

// I'm chaining the middlewares: Authenticate -> Verify they are a buyer -> Validate input -> Execute
router.get(
  "/",
  authMiddleware,
  authorize("BUYER"),
  validateCommodity,
  getRecommendationsController,
);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createReviewController,
  getFarmerReviewsController,
  getFarmerAverageRatingController,
  getBuyerReviewsController,
} = require("../controllers/reviewController");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { validateCreateReview } = require("../validators/review.validator");

// Create review (buyer only)
router.post("/", authMiddleware, authorize("BUYER"), validateCreateReview, createReviewController);

// Get farmer reviews (public)
router.get("/farmer/:farmerId", getFarmerReviewsController);

// Get farmer average rating (public)
router.get("/farmer/:farmerId/rating", getFarmerAverageRatingController);

// Get buyer's own reviews (buyer only)
router.get("/my-reviews", authMiddleware, authorize("BUYER"), getBuyerReviewsController);

module.exports = router;

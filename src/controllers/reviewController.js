const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const {
  createReview,
  getFarmerReviews,
  getFarmerAverageRating,
  getBuyerReviews,
} = require("../services/reviewService");

const createReviewController = asyncHandler(async (req, res) => {
  const { farmerId, rating, comment } = req.body;
  const buyerId = req.user.id;

  const review = await createReview(buyerId, farmerId, rating, comment);

  res.status(201).json({
    success: true,
    message: "Review submitted successfully",
    data: review,
  });
});

const getFarmerReviewsController = asyncHandler(async (req, res) => {
  const { farmerId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await getFarmerReviews(farmerId, page, limit);

  res.status(200).json({
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

const getFarmerAverageRatingController = asyncHandler(async (req, res) => {
  const { farmerId } = req.params;

  const result = await getFarmerAverageRating(farmerId);

  res.status(200).json({
    success: true,
    message: "Average rating retrieved successfully",
    data: result,
  });
});

const getBuyerReviewsController = asyncHandler(async (req, res) => {
  const buyerId = req.user.id;

  const reviews = await getBuyerReviews(buyerId);

  res.status(200).json({
    success: true,
    message: "Your reviews retrieved successfully",
    data: reviews,
  });
});

module.exports = {
  createReviewController,
  getFarmerReviewsController,
  getFarmerAverageRatingController,
  getBuyerReviewsController,
};

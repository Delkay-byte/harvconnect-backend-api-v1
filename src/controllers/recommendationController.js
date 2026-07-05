// src/controllers/recommendationController.js

const { getRecommendations } = require("../services/mlService");
const profileService = require("../services/profileService");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const getRecommendationsController = asyncHandler(async (req, res) => {
  const { commodity } = req.query;

  if (!commodity) {
    throw new AppError("Commodity query parameter is required.", 400);
  }

  const buyerProfile = await profileService.getBuyerProfile(req.user.id);

  if (buyerProfile.latitude == null || buyerProfile.longitude == null) {
    throw new AppError(
      "Buyer location is required before requesting recommendations.",
      400,
    );
  }

  const recommendations = await getRecommendations(
    commodity,
    buyerProfile.latitude,
    buyerProfile.longitude,
  );

  res.status(200).json({
    success: true,
    message: "Recommendations retrieved successfully.",
    data: recommendations,
  });
});

module.exports = {
  getRecommendationsController,
};

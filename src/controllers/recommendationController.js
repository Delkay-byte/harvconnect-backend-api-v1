// src/controllers/recommendationController.js
const { getRecommendations } = require("../services/mlService");
const profileService = require("../services/profileService");
const asyncHandler = require("../utils/asyncHandler");

const getRecommendationsController = asyncHandler(async (req, res) => {
  const { commodity } = req.query;

  // I'm pulling the coordinates from their profile, not trusting the frontend to send it
  const buyerProfile = await profileService.getBuyerProfile(req.user.id);

  const recommendations = await getRecommendations(
    commodity,
    buyerProfile.latitude,
    buyerProfile.longitude,
  );

  // Standardized response with the message field included
  res.status(200).json({
    success: true,
    message: "Recommendations retrieved successfully.",
    data: recommendations,
  });
});

module.exports = { getRecommendationsController };

// src/controllers/recommendationController.js
const { getRecommendations } = require("../services/mlService");
const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

const getRecommendationsController = asyncHandler(async (req, res) => {
  const { commodity } = req.query;

  // I'm pulling the coordinates from their profile, not trusting the frontend to send it
  const buyerProfile = await prisma.buyerProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!buyerProfile || !buyerProfile.latitude || !buyerProfile.longitude) {
    throw new AppError(
      "Please complete your profile with a delivery location first.",
      400,
    );
  }

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

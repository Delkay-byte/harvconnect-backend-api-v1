const profileService = require("../services/profileService");
const asyncHandler = require("../utils/asyncHandler");

const updateFarmerProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.upsertFarmerProfile(
    req.user.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Farmer profile updated successfully.",
    data: {
      profile,
    },
  });
});

const updateBuyerProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.upsertBuyerProfile(
    req.user.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Buyer profile updated successfully.",
    data: {
      profile,
    },
  });
});

module.exports = {
  updateFarmerProfile,
  updateBuyerProfile,
};

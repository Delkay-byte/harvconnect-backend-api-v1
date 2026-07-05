const asyncHandler = require("../utils/asyncHandler");
const transportService = require("../services/transportService");

const updateLocationAndStatus = asyncHandler(async (req, res) => {
  const updated = await transportService.updateTransportProfile(
    req.user.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Transport profile updated successfully.",
    data: updated,
  });
});

module.exports = {
  updateLocationAndStatus,
};

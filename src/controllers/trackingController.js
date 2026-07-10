const asyncHandler = require("../utils/asyncHandler");
const trackingService = require("../services/trackingService");

const getTracking = asyncHandler(async (req, res) => {
  const data = await trackingService.getTracking(req.params.id, req.user.id, req.user.role);
  res.status(200).json({ success: true, data });
});

const startTracking = asyncHandler(async (req, res) => {
  const data = await trackingService.startTracking(req.params.id, req.user.id);
  res.status(200).json({ success: true, data });
});

const markPickedUp = asyncHandler(async (req, res) => {
  const data = await trackingService.markPickedUp(req.params.id, req.user.id);
  res.status(200).json({ success: true, data });
});

const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  const data = await trackingService.updateLocation(req.params.id, req.user.id, lat, lng);
  res.status(200).json({ success: true, data });
});

const markDelivered = asyncHandler(async (req, res) => {
  const data = await trackingService.markDelivered(req.params.id, req.user.id);
  res.status(200).json({ success: true, data });
});

module.exports = {
  getTracking,
  startTracking,
  markPickedUp,
  updateLocation,
  markDelivered,
};
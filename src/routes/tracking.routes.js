const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  getTracking,
  startTracking,
  markPickedUp,
  updateLocation,
  markDelivered,
} = require("../controllers/trackingController");

router.get("/:id/tracking", authMiddleware, getTracking);
router.post("/:id/tracking/start", authMiddleware, startTracking);
router.put("/:id/tracking/location", authMiddleware, updateLocation);
router.post("/:id/tracking/picked-up", authMiddleware, markPickedUp);
router.post("/:id/tracking/deliver", authMiddleware, markDelivered);

module.exports = router;
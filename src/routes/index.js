const express = require("express");

const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/products", require("./product.routes"));
router.use("/orders", require("./order.routes"));
router.use("/profile", require("./profile.routes"));
router.use("/transport", require("./transport.routes"));
router.use("/recommendations", require("./recommendation.routes"));

module.exports = router;

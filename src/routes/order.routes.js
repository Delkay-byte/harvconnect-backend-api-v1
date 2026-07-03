const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const { placeOrder, changeStatus, getMyOrders } = require("../controllers/orderController");

router.get("/", authMiddleware, getMyOrders);
router.post("/", authMiddleware, placeOrder);
router.patch("/:id/status", authMiddleware, changeStatus);

module.exports = router;
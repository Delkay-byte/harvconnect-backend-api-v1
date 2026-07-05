const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const { placeOrder, changeStatus, getMyOrders } = require("../controllers/orderController");
const { validateCreateOrder, validateUpdateStatus } = require("../validators/order.validator");

router.get("/", authMiddleware, getMyOrders);
router.post("/", authMiddleware, authorize("BUYER"), validateCreateOrder, placeOrder);
router.patch("/:id/status", authMiddleware, authorize("FARMER"), validateUpdateStatus, changeStatus);

module.exports = router;

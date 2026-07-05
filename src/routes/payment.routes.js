const express = require("express");
const router = express.Router();

const { requestMomoPayment } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/auth.middleware");
const { validatePayment } = require("../validators/payment.validator");

router.post("/momo", authMiddleware, validatePayment, requestMomoPayment);

module.exports = router;

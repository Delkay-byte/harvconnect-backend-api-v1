const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { processMomoPayment } = require("../services/paymentService");

const requestMomoPayment = asyncHandler(async (req, res) => {
  const { phoneNumber, amount, network, reference } = req.body;

  const paymentResult = await processMomoPayment({
    phoneNumber,
    amount,
    network,
    reference,
  });

  res.status(200).json({
    success: true,
    message: "Payment successful",
    data: paymentResult,
  });
});

module.exports = { requestMomoPayment };

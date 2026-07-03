const asyncHandler = require("../utils/asyncHandler");
const orderService = require("../services/orderService");

const placeOrder = asyncHandler(async (req, res) => {
  // Only buyers should be placing orders
  if (req.user.role !== "BUYER") {
    return res.status(403).json({ success: false, message: "Only buyers can place orders." });
  }

  const order = await orderService.createOrder(req.user.id, req.body);
  
  res.status(201).json({ success: true, data: order });
});

const changeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, req.user.id, status, req.user.role);
  
  res.status(200).json({ success: true, data: order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.id, req.user.role);
  res.status(200).json({ success: true, data: orders });
});

module.exports = {
  placeOrder,
  changeStatus,
  getMyOrders,
};
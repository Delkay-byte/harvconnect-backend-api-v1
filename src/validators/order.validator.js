const { z } = require("zod");
const validate = require("../middleware/validate");

const orderSchema = z.object({
  productId: z.string().uuid({ message: "Product ID must be a valid UUID." }),
  quantity: z.number().int().positive({ message: "Quantity must be at least 1." }),
  deliveryAddress: z.string().min(5, { message: "Delivery address must be at least 5 characters." }).max(200, { message: "Delivery address cannot exceed 200 characters." }),
});

const validateCreateOrder = validate(orderSchema);

const updateStatusSchema = z.object({
  status: z.enum(
    [
      "PENDING",
      "ACCEPTED",
      "REJECTED",
      "READY_FOR_TRANSPORT",
      "IN_TRANSIT",
      "DELIVERED",
      "CANCELLED",
    ],
    { message: "Invalid order status." }
  ),
});

const validateUpdateStatus = validate(updateStatusSchema);

module.exports = {
  validateCreateOrder,
  validateUpdateStatus,
};
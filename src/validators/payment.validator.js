const { z } = require("zod");
const validate = require("../middleware/validate");
const { MOMO_NETWORKS } = require("../services/paymentService");

const paymentSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  amount: z.number().positive("Amount must be greater than zero"),
  network: z.enum(MOMO_NETWORKS, { message: `Invalid network. Must be one of: ${MOMO_NETWORKS.join(", ")}` }),
  reference: z.string().optional(),
});

const validatePayment = validate(paymentSchema);

module.exports = { validatePayment };

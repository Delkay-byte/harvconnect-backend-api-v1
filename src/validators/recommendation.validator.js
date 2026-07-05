const { z } = require("zod");
const commodities = require("../constants/commodities");
const validate = require("../middleware/validate");

const commoditySchema = z.object({
  commodity: z.enum(Object.values(commodities), { message: "Invalid commodity selected." }),
});

const validateCommodity = validate(commoditySchema);

module.exports = { validateCommodity };
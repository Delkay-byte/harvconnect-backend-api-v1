const { z } = require("zod");
const commodities = require("../constants/commodities");
const validate = require("../middleware/validate");

const commoditySchema = z.object({
  commodity: z.enum(commodities, { message: "Invalid commodity selected." }),
});

const validateCommodity = validate(commoditySchema);

module.exports = { validateCommodity };
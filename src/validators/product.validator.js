const { z } = require("zod");
const COMMODITIES = require("../constants/commodities");
const UNITS = require("../constants/units");
const validate = require("../middleware/validate");

const createProductSchema = z.object({
  name: z.string().trim().min(2, { message: "Product name must be at least 2 characters." }).max(100, { message: "Product name cannot exceed 100 characters." }),
  description: z.string().trim().max(500, { message: "Description cannot exceed 500 characters." }).optional(),
  price: z.number().positive({ message: "Price must be a positive number." }),
  quantity: z.number().positive({ message: "Quantity must be a positive number." }),
  unit: z.string().trim().transform((val) => val.toUpperCase()).refine((val) => UNITS.includes(val), { message: `Invalid unit. Allowed values: ${UNITS.join(", ")}` }),
  category: z.string().trim().transform((val) => val.toUpperCase()).refine((val) => Object.values(COMMODITIES).includes(val), { message: "Invalid commodity category selection." }),
  harvestDate: z.string().datetime({ message: "Harvest date must be a valid ISO8601 timestamp." }).optional(),
  imageUrl: z.string().url({ message: "Image link must be a valid URL string." }).optional(),
});

const validateCreateProduct = validate(createProductSchema);

const updateProductSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  price: z.number().positive().optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().trim().transform((val) => val.toUpperCase()).refine((val) => UNITS.includes(val)).optional(),
  category: z.string().trim().transform((val) => val.toUpperCase()).refine((val) => Object.values(COMMODITIES).includes(val)).optional(),
  harvestDate: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
});

const validateUpdateProduct = validate(updateProductSchema);

module.exports = { validateCreateProduct, validateUpdateProduct };
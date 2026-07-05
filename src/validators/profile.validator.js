const { z } = require("zod");
const validate = require("../middleware/validate");

const farmerProfileSchema = z.object({
  farmName: z.string().trim().min(2, { message: "Farm name must be at least 2 characters." }).max(100, { message: "Farm name cannot exceed 100 characters." }).optional(),
  bio: z.string().trim().max(500, { message: "Bio cannot exceed 500 characters." }).optional(),
  address: z.string().trim().max(200, { message: "Address cannot exceed 200 characters." }).optional(),
  latitude: z.number().min(-90).max(90, { message: "Latitude must be a valid coordinate between -90 and 90." }).optional(),
  longitude: z.number().min(-180).max(180, { message: "Longitude must be a valid coordinate between -180 and 180." }).optional(),
});

const validateFarmerProfile = validate(farmerProfileSchema);

const buyerProfileSchema = z.object({
  deliveryAddress: z.string().trim().max(200, { message: "Delivery address cannot exceed 200 characters." }).optional(),
  latitude: z.number().min(-90).max(90, { message: "Latitude must be a valid coordinate between -90 and 90." }).optional(),
  longitude: z.number().min(-180).max(180, { message: "Longitude must be a valid coordinate between -180 and 180." }).optional(),
});

const validateBuyerProfile = validate(buyerProfileSchema);

module.exports = {
  validateFarmerProfile,
  validateBuyerProfile,
};
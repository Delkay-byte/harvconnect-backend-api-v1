const { z } = require("zod");
const validate = require("../middleware/validate");

const updateTransportSchema = z.object({
  available: z.boolean().optional(),
  latitude: z.number().min(-90).max(90, { message: "Latitude must be a valid coordinate between -90 and 90." }),
  longitude: z.number().min(-180).max(180, { message: "Longitude must be a valid coordinate between -180 and 180." }),
  currentAddress: z.string().trim().max(200, { message: "Address cannot exceed 200 characters." }).optional(),
  currentRegion: z.string().trim().max(100, { message: "Region cannot exceed 100 characters." }).optional(),
});

const validateUpdateTransport = validate(updateTransportSchema);

module.exports = { validateUpdateTransport };
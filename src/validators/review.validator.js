const { z } = require("zod");
const validate = require("../middleware/validate");

const createReviewSchema = z.object({
  farmerId: z.string().uuid("Invalid farmer ID"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().optional(),
});

const validateCreateReview = validate(createReviewSchema);

module.exports = { validateCreateReview };

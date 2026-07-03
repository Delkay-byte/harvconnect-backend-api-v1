// src/middleware/ownership.middleware.js
const AppError = require("../utils/AppError");

/**
 * @param {Function} fetchResource - A function that fetches the item (e.g., product/order)
 * @param {string} userIdField - The field on the resource that links to the owner
 */
const checkOwnership = (fetchResource, userIdField = "userId") => {
  return async (req, res, next) => {
    try {
      const resource = await fetchResource(req.params.id);

      if (!resource) return next(new AppError("Resource not found", 404));

      // Compare current user ID with resource owner ID
      if (resource[userIdField] !== req.user.id) {
        return next(
          new AppError("You are not authorized to edit this resource", 403),
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = checkOwnership;

const { z } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    // Validate the incoming body against the Zod schema
    const result = schema.safeParse(req.body);
    
    if (!result.success) {
      // Send a structured error back to the client
      const errors = (result.error.errors || []).map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors,
      });
    }
    
    next();
  } catch (err) {
    // If there's an unexpected error, pass it to the error handler
    return next(err);
  }
};

module.exports = validate;
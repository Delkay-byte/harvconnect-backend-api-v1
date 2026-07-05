const Logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  const isTestEnvironment = process.env.NODE_ENV === "test";

  if (!isTestEnvironment) {
    Logger.error("Unhandled application error", {
      message: err.message || "Unknown error",
      stack: err.stack,
      statusCode: err.statusCode || 500,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};

module.exports = errorHandler;

// src/middleware/auth.middleware.js
const { verifyToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");
const prisma = require("../config/prisma"); // Import prisma instance

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return next(new AppError("Authentication token is missing.", 401));
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Verify user still exists in DB and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return next(new AppError("User no longer exists.", 401));
    }

    // Attach full user object to the request
    req.user = user;
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token.", 401));
  }
};

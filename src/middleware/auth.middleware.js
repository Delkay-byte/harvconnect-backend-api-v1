const AppError = require("../utils/AppError");
const { verifyToken } = require("../utils/jwt");
const prisma = require("../config/prisma");
const MESSAGES = require("../constants/messages");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(MESSAGES.TOKEN_MISSING, 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    // Verify the account is still active after token verification
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    // If the token is valid but the user has been deactivated, reject the request
    if (!currentUser || currentUser.isActive === false) {
      return next(new AppError(MESSAGES.ACCOUNT_DEACTIVATED, 401));
    }

    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError(MESSAGES.INVALID_TOKEN, 401));
  }
};

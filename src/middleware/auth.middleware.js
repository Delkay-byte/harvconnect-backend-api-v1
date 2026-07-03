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
    
    // I am verifying the account is still alive after token verification
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    // I am adding a strict check here. If the token is mathematically valid but the user soft-deleted their account 5 minutes ago, I reject the request immediately.
    if (!currentUser || !currentUser.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: "This account has been deactivated." 
      });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError(MESSAGES.INVALID_TOKEN, 401));
  }
};

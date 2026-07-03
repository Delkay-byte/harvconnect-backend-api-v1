const authService = require("../services/authService");
const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const MESSAGES = require("../constants/messages");
const AppError = require("../utils/AppError");

const register = asyncHandler(async (req, res) => {
  const safeUser = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: MESSAGES.REGISTER_SUCCESS,
    data: {
      user: safeUser,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.loginUser(req.body);

  res.status(200).json({
    success: true,
    message: MESSAGES.LOGIN_SUCCESS,
    data: {
      token,
      user,
    },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      farmerProfile: true,
      buyerProfile: true,
      transportProfile: true,
    },
  });

  if (!user) {
    throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
  }

  const { password, ...safeUser } = user;

  res.status(200).json({
    success: true,
    message: MESSAGES.PROFILE_FETCH_SUCCESS,
    data: safeUser,
  });
});

const deactivateAccount = asyncHandler(async (req, res) => {
  // I am pulling the ID directly from the JWT token so a user can only delete their own account
  await authService.deleteAccount(req.user.id);

  res.status(200).json({
    success: true,
    message:
      "Your account has been successfully deleted. We are sorry to see you go.",
  });
});

module.exports = {
  register,
  login,
  getMe,
  deactivateAccount,
};

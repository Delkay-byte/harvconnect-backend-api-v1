const authService = require("../services/authService");
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
  const user = await authService.getUserById(req.user.id);

  res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    data: user,
  });
});

const deactivateAccount = asyncHandler(async (req, res) => {
  // Pulling the ID directly from the JWT token so a user can only delete their own account
  await authService.deleteAccount(req.user.id);

  res.status(200).json({
    success: true,
    message:
      "Your account has been successfully deleted. We are sorry to see you go.",
  });
});

const verifyEmail = asyncHandler(async (req, res) => {
  // Support both GET (query params) and POST (body)
  const token = req.body.token || req.query.token;
  if (!token) throw new AppError("Verification token is required", 400);

  await authService.verifyEmail(token);

  res.status(200).json({
    success: true,
    message: "Email successfully verified. You can now access all features.",
  });
});

const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError("Email is required.", 400);
  }

  await authService.resendVerification(email.trim().toLowerCase());

  return res.status(200).json({
    success: true,
    message:
      "If an account exists and is not yet verified, a verification email has been sent.",
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError("Email is required", 400);

  await authService.forgotPassword(email);

  res.status(200).json({
    success: true,
    message:
      "If an account exists with that email, a password reset link has been sent.",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    throw new AppError("Token and new password are required", 400);

  await authService.resetPassword(token, password);

  res.status(200).json({
    success: true,
    message: "Password has been successfully reset. You can now log in.",
  });
});

module.exports = {
  register,
  login,
  getMe,
  deactivateAccount,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
};

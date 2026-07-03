// src/controllers/authController.js
const authService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  // We remove the password from the response for security
  user.password = undefined;

  res.status(201).json({
    success: true,
    message: "User registered successfully.",
    data: user,
  });
});

const login = asyncHandler(async (req, res) => {
  // Assuming your authService.loginUser returns the token and user data
  const { token, user } = await authService.loginUser(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    token,
    data: user,
  });
});

const getMe = asyncHandler(async (req, res) => {
  // req.user.id comes from the decoded JWT in the authMiddleware
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      farmerProfile: true,
      buyerProfile: true,
      transportProfile: true,
    },
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  // Never leak the password hash to the client
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: "User profile retrieved successfully.",
    data: user,
  });
});

// Now the names match exactly what is defined above
module.exports = { register, login, getMe };

const express = require("express");
const {
  register,
  login,
  getMe,
  deactivateAccount,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require("../validators/auth.validator");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Health check
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth router is working.",
  });
});

// Standard Authentication
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", authMiddleware, getMe);
router.delete("/delete", authMiddleware, deactivateAccount);

// Email Verification & Password Recovery
router.get("/verify-email", verifyEmail);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);

module.exports = router;

// src/routes/auth.routes.js
const express = require("express");
const { register, login, getMe, deactivateAccount } = require("../controllers/authController");
const { validateRegister } = require("../validators/auth.validator");
const { validateLogin } = require("../validators/login.validator");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth router is working.",
  });
});
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", authMiddleware, getMe);

// I am protecting this route so only a logged-in user can pull the plug on their account
router.delete("/account", authMiddleware, deactivateAccount);

module.exports = router;

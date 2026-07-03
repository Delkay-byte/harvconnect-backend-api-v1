// src/routes/auth.routes.js
const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
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

module.exports = router;

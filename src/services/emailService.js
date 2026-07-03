// src/services/emailService.js
// You'll need to run: npm install nodemailer
const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, token) => {
  // Simple implementation for now
  console.log(`Sending verification email to ${email} with token: ${token}`);
};

module.exports = { sendVerificationEmail };

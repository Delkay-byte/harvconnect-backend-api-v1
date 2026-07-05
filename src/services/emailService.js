const { Resend } = require("resend");
const AppError = require("../utils/AppError");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "HarvConnect <noreply@harvconnect.com>";

const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    // Check for the hidden API error
    if (response.error) {
      console.error("[RESEND_API_ERROR]", response.error);
      throw new AppError(`Email service error: ${response.error.message}`, 500);
    }

    return response;
  } catch (err) {
    // If it's already an AppError, rethrow it.
    // Otherwise, wrap it to keep our error logging consistent.
    if (err instanceof AppError) throw err;

    console.error("[EMAIL_SERVICE_CRITICAL_FAILURE]", err);
    throw new AppError("Email service currently unavailable", 503);
  }
};

const sendVerificationEmail = async (email, token) => {
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Verify your HarvConnect account",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Verify Your Account</h2>
        <p>Click below to activate your account and join the marketplace:</p>
        <a href="${link}" style="display:inline-block;padding:10px 16px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;margin: 15px 0;">
          Verify Account
        </a>
        <p style="margin-top:10px; font-size: 14px; color: #555;">This link expires in 30 minutes.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Reset your HarvConnect password",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Click below to securely reset your password:</p>
        <a href="${link}" style="display:inline-block;padding:10px 16px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;margin: 15px 0;">
          Reset Password
        </a>
        <p style="margin-top:10px; font-size: 14px; color: #555;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};

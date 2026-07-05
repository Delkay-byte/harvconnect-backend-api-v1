// Test setup file to mock external services
jest.mock("../services/emailService", () => ({
  sendVerificationEmail: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
}));

// Mock environment variables
process.env.RESEND_API_KEY = "test-api-key";
process.env.RESEND_FROM_EMAIL = "test@harvconnect.com";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRY = "1h";
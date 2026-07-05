/**
 * Factory for creating test farmer users
 */

const request = require("supertest");
const app = require("../../app");

const createFarmer = async (overrides = {}) => {
  const password = "SecurePassword123@";
  const timestamp = Date.now();
  
  const defaultData = {
    fullName: "Test Farmer",
    email: `farmer_${timestamp}@test.com`,
    phone: `+23324${Math.floor(1000000 + Math.random() * 9000000)}`,
    password,
    role: "FARMER",
  };

  const userData = { ...defaultData, ...overrides };

  // Register
  const registerRes = await request(app)
    .post("/api/v1/auth/register")
    .send(userData);

  if (registerRes.status !== 201) {
    throw new Error(`Failed to register farmer: ${JSON.stringify(registerRes.body)}`);
  }

  const userId = registerRes.body.data.user.id;

  // Login
  const loginRes = await request(app)
    .post("/api/v1/auth/login")
    .send({
      email: userData.email,
      password,
    });

  if (loginRes.status !== 200) {
    throw new Error(`Failed to login farmer: ${JSON.stringify(loginRes.body)}`);
  }

  return {
    userId,
    token: loginRes.body.data.token,
    email: userData.email,
    ...registerRes.body.data.user,
  };
};

module.exports = createFarmer;
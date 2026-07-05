const request = require("supertest");
const app = require("../app");
const prisma = require("../config/prisma");
const resetDatabase = require("../test/helpers/resetDatabase");

// Helper function to verify user email
const verifyUserEmail = async (email) => {
  const tokenRecord = await prisma.authToken.findFirst({
    where: {
      type: "VERIFY_EMAIL",
      user: { email },
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (tokenRecord) {
    await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: tokenRecord.token });
  }
};

describe("HarvConnect API - Authentication Tests", () => {
  // Clear out the user ledger before starting the test suite so old data doesn't break things
  beforeAll(async () => {
    await resetDatabase();
  }, 10000);

  // Disconnect from Postgres completely once all tests finish to prevent Jest from hanging
  afterAll(async () => {
    await prisma.$disconnect();
  });

  const testUser = {
    fullName: "Saviour Amegayie",
    email: "amegayietest@gmail.com",
    phone: "+233240000000",
    password: "SecurePassword123@",
    role: "FARMER",
  };

  describe("POST /api/v1/auth/register", () => {
    it("should successfully register a brand new farmer profile", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty("id");
      expect(response.body.data.user.email).toBe(testUser.email);
      // The password must NEVER be exposed in the response payload
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("should reject a registration attempt if the email is already registered", async () => {
      // Sending the exact same payload a second time
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should authenticate the user and return a signed JWT token", async () => {
      // First verify the user's email before logging in
      await verifyUserEmail(testUser.email);
      
      const response = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Ensure the server actually returns the signed authorization string
      expect(response.body.data).toHaveProperty("token");
    });

    it("should block login attempts with an invalid password", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: "WrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.token).toBeUndefined();
    });
  });

  describe("DELETE /api/v1/auth/delete", () => {
    it("should soft-delete the authenticated user's account", async () => {
      // 1. Log in to get a fresh token for our test user
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      const token = loginRes.body.data.token;

      // 2. Hit the delete endpoint with that token
      const deleteRes = await request(app)
        .delete("/api/v1/auth/delete")
        .set("Authorization", `Bearer ${token}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // 3. The Ghost Test: Try to log in again. It MUST fail.
      const ghostLoginRes = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(ghostLoginRes.status).toBe(401);
      expect(ghostLoginRes.body.message).toMatch(/deactivated|Invalid/i);
    });
  });
});

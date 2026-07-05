const request = require("supertest");
const app = require("../app");
const prisma = require("../config/prisma");
const resetDatabase = require("../test/helpers/resetDatabase");

// Mock the ML service
jest.mock("../services/mlService", () => ({
  getRecommendations: jest.fn(),
}));

const { getRecommendations } = require("../services/mlService");

describe("HarvConnect API - ML Recommendations", () => {
  let buyerToken, buyerId;

  beforeAll(async () => {
    await resetDatabase();

    // Create a Buyer
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Buyer Test",
      email: "buyer@test.com",
      phone: "+233240000002",
      password: "SecurePassword123@",
      role: "BUYER",
    });

    const buyer = await prisma.user.findUnique({
      where: { email: "buyer@test.com" },
    });
    buyerId = buyer.id;

    // Verify buyer email
    const tokenRecord = await prisma.authToken.findFirst({
      where: {
        type: "VERIFY_EMAIL",
        user: { email: "buyer@test.com" },
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (tokenRecord) {
      await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token: tokenRecord.token });
    }

    const buyerLogin = await request(app).post("/api/v1/auth/login").send({
      email: "buyer@test.com",
      password: "SecurePassword123@",
    });
    buyerToken = buyerLogin.body.data.token;

    // Set buyer's location
    await request(app)
      .patch("/api/v1/profile/buyer")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        deliveryAddress: "Accra Central",
        latitude: 5.6037,
        longitude: -0.1870,
      });
  }, 15000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("GET /api/v1/recommendations", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return 400 when commodity parameter is missing", async () => {
      const response = await request(app)
        .get("/api/v1/recommendations")
        .set("Authorization", `Bearer ${buyerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 when buyer coordinates are missing", async () => {
      // Create another buyer without location
      await request(app).post("/api/v1/auth/register").send({
        fullName: "Buyer No Location",
        email: "buyer2@test.com",
        phone: "+233240000003",
        password: "SecurePassword123@",
        role: "BUYER",
      });

      const buyer2 = await prisma.user.findUnique({
        where: { email: "buyer2@test.com" },
      });

      // Verify buyer2 email
      const tokenRecord = await prisma.authToken.findFirst({
        where: {
          type: "VERIFY_EMAIL",
          user: { email: "buyer2@test.com" },
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (tokenRecord) {
        await request(app)
          .post("/api/v1/auth/verify-email")
          .send({ token: tokenRecord.token });
      }

      const buyer2Login = await request(app).post("/api/v1/auth/login").send({
        email: "buyer2@test.com",
        password: "SecurePassword123@",
      });
      const buyer2Token = buyer2Login.body.data.token;

      const response = await request(app)
        .get("/api/v1/recommendations?commodity=TOMATO_LOCAL")
        .set("Authorization", `Bearer ${buyer2Token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 when request is unauthorized", async () => {
      const response = await request(app).get(
        "/api/v1/recommendations?commodity=TOMATO_LOCAL"
      );

      expect(response.status).toBe(401);
    });
  });
});

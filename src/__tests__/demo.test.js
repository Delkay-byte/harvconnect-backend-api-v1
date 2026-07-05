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

describe("HarvConnect API - Demo Features Tests", () => {
  let farmerToken, buyerToken, farmerId, buyerId;

  beforeAll(async () => {
    // Note: Not resetting database to avoid conflicts with other tests running in parallel
    // These tests create their own isolated test data
    const farmerRes = await request(app).post("/api/v1/auth/register").send({
      fullName: "Kwame Mensah",
      email: "kwame.mensah@harvconnect.com",
      phone: "+2332000000001",
      password: "Hackathon2026!",
      role: "FARMER",
    });

    await verifyUserEmail("kwame.mensah@harvconnect.com");

    const farmerLogin = await request(app).post("/api/v1/auth/login").send({
      email: "kwame.mensah@harvconnect.com",
      password: "Hackathon2026!",
    });
    farmerToken = farmerLogin.body.data.token;

    const farmer = await prisma.user.findUnique({
      where: { email: "kwame.mensah@harvconnect.com" },
    });
    farmerId = farmer.id;

    // Create farmer profile
    await request(app)
      .patch("/api/v1/profile/farmer")
      .set("Authorization", `Bearer ${farmerToken}`)
      .send({
        farmName: "Kwame's Farm",
        bio: "Experienced vegetable farmer",
        address: "Accra Central",
        latitude: 5.6037,
        longitude: -0.187,
      });

    // Create a Product
    await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${farmerToken}`)
      .send({
        name: "Fresh Tomatoes",
        description: "Fresh local tomatoes",
        price: 150.0,
        quantity: 20,
        category: "TOMATO_LOCAL",
        unit: "BAG",
      });

    // Create a Buyer
    const buyerRes = await request(app).post("/api/v1/auth/register").send({
      fullName: "Abena Ofori",
      email: "abena.ofori@harvconnect.com",
      phone: "+2332400000001",
      password: "Hackathon2026!",
      role: "BUYER",
    });

    await verifyUserEmail("abena.ofori@harvconnect.com");

    const buyerLogin = await request(app).post("/api/v1/auth/login").send({
      email: "abena.ofori@harvconnect.com",
      password: "Hackathon2026!",
    });
    buyerToken = buyerLogin.body.data.token;

    const buyer = await prisma.user.findUnique({
      where: { email: "abena.ofori@harvconnect.com" },
    });
    buyerId = buyer.id;

    // Create buyer profile
    await request(app)
      .patch("/api/v1/profile/buyer")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        deliveryAddress: "Tema, Ghana",
        latitude: 5.6415,
        longitude: -0.2441,
      });
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Review System", () => {
    it("should allow a buyer to create a review for a farmer", async () => {
      const response = await request(app)
        .post("/api/v1/reviews")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          farmerId: farmerId,
          rating: 5,
          comment: "Excellent quality produce, very fresh!",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.comment).toBe("Excellent quality produce, very fresh!");
      expect(response.body.data.buyerId).toBe(buyerId);
      expect(response.body.data.farmerId).toBe(farmerId);
    });

    it("should prevent duplicate reviews (should update instead)", async () => {
      // Create first review
      await request(app)
        .post("/api/v1/reviews")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          farmerId: farmerId,
          rating: 4,
          comment: "Good quality",
        });

      // Try to create another review for the same farmer
      const response = await request(app)
        .post("/api/v1/reviews")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          farmerId: farmerId,
          rating: 5,
          comment: "Updated review",
        });

      expect(response.status).toBe(201);
      expect(response.body.data.rating).toBe(5);
      expect(response.body.data.comment).toBe("Updated review");

      // Verify only one review exists in database
      const reviews = await prisma.review.findMany({
        where: { buyerId, farmerId },
      });
      expect(reviews.length).toBe(1);
    });

    it("should reject rating outside 1-5 range", async () => {
      const response = await request(app)
        .post("/api/v1/reviews")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          farmerId: farmerId,
          rating: 6,
          comment: "Invalid rating",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should reject review from non-buyer role", async () => {
      // Create a transporter
      const transporterRes = await request(app).post("/api/v1/auth/register").send({
        fullName: "Isaac Boateng",
        email: "isaac.boateng@harvconnect.com",
        phone: "+2332500000001",
        password: "Hackathon2026!",
        role: "TRANSPORT",
      });

      await verifyUserEmail("isaac.boateng@harvconnect.com");

      const transporterLogin = await request(app).post("/api/v1/auth/login").send({
        email: "isaac.boateng@harvconnect.com",
        password: "Hackathon2026!",
      });
      const transporterToken = transporterLogin.body.data.token;

      const response = await request(app)
        .post("/api/v1/reviews")
        .set("Authorization", `Bearer ${transporterToken}`)
        .send({
          farmerId: farmerId,
          rating: 5,
          comment: "Great farmer",
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it("should retrieve farmer reviews with pagination", async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/farmer/${farmerId}?page=1&limit=10`)
        .set("Authorization", `Bearer ${buyerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toBeDefined();
      expect(Array.isArray(response.body.data.reviews)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
    });

    it("should calculate average rating for a farmer", async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/farmer/${farmerId}/rating`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.averageRating).toBeDefined();
      expect(response.body.data.totalReviews).toBeDefined();
      expect(typeof response.body.data.averageRating).toBe("number");
      expect(typeof response.body.data.totalReviews).toBe("number");
    });

    it("should retrieve buyer's own reviews", async () => {
      const response = await request(app)
        .get("/api/v1/reviews/my-reviews")
        .set("Authorization", `Bearer ${buyerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should require buyer role for my-reviews endpoint", async () => {
      // Create a farmer
      const farmer2Res = await request(app).post("/api/v1/auth/register").send({
        fullName: "Kofi Asante",
        email: "kofi.asante@harvconnect.com",
        phone: "+2332000000002",
        password: "Hackathon2026!",
        role: "FARMER",
      });

      await verifyUserEmail("kofi.asante@harvconnect.com");

      const farmer2Login = await request(app).post("/api/v1/auth/login").send({
        email: "kofi.asante@harvconnect.com",
        password: "Hackathon2026!",
      });
      const farmer2Token = farmer2Login.body.data.token;

      const response = await request(app)
        .get("/api/v1/reviews/my-reviews")
        .set("Authorization", `Bearer ${farmer2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe("Seed Data Validation", () => {
    it("should have demo users with correct passwords", async () => {
      // Test that the demo password works for seeded users
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "kwame.mensah@harvconnect.com",
        password: "Hackathon2026!",
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.token).toBeDefined();
    });

    it("should have verified user accounts", async () => {
      const user = await prisma.user.findUnique({
        where: { email: "kwame.mensah@harvconnect.com" },
      });

      expect(user).toBeDefined();
      expect(user.isVerified).toBe(true);
      expect(user.emailVerifiedAt).toBeDefined();
    });

    it("should have farmer profiles with GPS coordinates", async () => {
      const farmerProfile = await prisma.farmerProfile.findUnique({
        where: { userId: farmerId },
      });

      expect(farmerProfile).toBeDefined();
      expect(farmerProfile.latitude).toBeDefined();
      expect(farmerProfile.longitude).toBeDefined();
      expect(farmerProfile.farmName).toBeDefined();
    });

    it("should have products with correct categories", async () => {
      const products = await prisma.product.findMany({
        where: { farmerId },
      });

      expect(products.length).toBeGreaterThan(0);
      products.forEach((product) => {
        expect([
          "TOMATO_LOCAL",
          "TOMATO_HYBRID",
          "PEPPER",
          "OKRA",
          "GARDEN_EGGS",
        ]).toContain(product.category);
      });
    });
  });
});
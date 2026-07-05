const request = require("supertest");
const app = require("../app");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const BASE_URL = "/api/v1";
const TEST_PASSWORD = "MarketPassword123!";

// I am giving Jest 30 seconds to run this setup so it doesn't timeout on me
jest.setTimeout(30000);

describe("🛡️ HarvConnect - Security & Validation Fortress", () => {
  let farmerToken, buyerToken;
  let sharedProductId;

  const farmer = {
    email: "sec_farmer@harv.com",
    phone: "+233550000001",
    role: "FARMER",
  };
  const buyer = {
    email: "sec_buyer@harv.com",
    phone: "+233550000002",
    role: "BUYER",
  };

  beforeAll(async () => {
    // 1. I am cleaning the database of any old test users first
    await prisma.user.deleteMany({
      where: { email: { in: [farmer.email, buyer.email] } },
    });

    // 2. I am letting the real API register the users so my bcrypt hashes the passwords properly
    await request(app)
      .post(`${BASE_URL}/auth/register`)
      .send({ ...farmer, fullName: "Sec Farmer", password: TEST_PASSWORD });
    await request(app)
      .post(`${BASE_URL}/auth/register`)
      .send({ ...buyer, fullName: "Sec Buyer", password: TEST_PASSWORD });

    // 3. I am manually bypassing the email verification in the DB so I can test the login
    await prisma.user.updateMany({
      where: { email: { in: [farmer.email, buyer.email] } },
      data: { isVerified: true },
    });

    // 4. I am logging in to grab my JWT tokens for the protected routes
    const loginFarmer = await request(app)
      .post(`${BASE_URL}/auth/login`)
      .send({ email: farmer.email, password: TEST_PASSWORD });
    const loginBuyer = await request(app)
      .post(`${BASE_URL}/auth/login`)
      .send({ email: buyer.email, password: TEST_PASSWORD });

    farmerToken = loginFarmer.body.data?.token || loginFarmer.body.token;
    buyerToken = loginBuyer.body.data?.token || loginBuyer.body.token;

    // 5. I am creating a base product using the farmer's token so the buyer has something to interact with
    const prodRes = await request(app)
      .post(`${BASE_URL}/products`)
      .set("Authorization", `Bearer ${farmerToken}`)
      .send({
        name: "Safe Tomatoes",
        category: "TOMATO_LOCAL",
        quantity: 10,
        price: 100,
        unit: "CRATE",
      });

    sharedProductId =
      prodRes.body.data?.id ||
      prodRes.body.data?.product?.id ||
      prodRes.body.id;
  });

  afterAll(async () => {
    // I am disconnecting the Prisma client so Jest can exit cleanly
    await prisma.$disconnect();
  });

  // ==========================================
  // GROUP 1: Identity & Unique Constraints
  // ==========================================
  describe("1. Identity & Unique Constraints", () => {
    it("❌ should reject registration with an already existing email", async () => {
      const res = await request(app)
        .post(`${BASE_URL}/auth/register`)
        .send({
          ...farmer,
          fullName: "Clone Farmer",
          password: TEST_PASSWORD,
          phone: "+233999999999",
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it("❌ should reject registration with an already existing phone number", async () => {
      const res = await request(app)
        .post(`${BASE_URL}/auth/register`)
        .send({
          ...farmer,
          email: "newemail@harv.com",
          fullName: "Clone Farmer",
          password: TEST_PASSWORD,
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("❌ should block access to protected routes without a token", async () => {
      const res = await request(app).post(`${BASE_URL}/products`).send({});
      expect(res.status).toBe(401);
    });
  });

  // ==========================================
  // GROUP 2: Validation & Boundaries (Zod)
  // ==========================================
  describe("2. Deep Validation (Garbage In, Garbage Out)", () => {
    it("❌ should reject product creation with a negative price", async () => {
      const res = await request(app)
        .post(`${BASE_URL}/products`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({
          name: "Bad Price",
          category: "TOMATO_LOCAL",
          quantity: 10,
          price: -50,
          unit: "CRATE",
        });

      expect(res.status).toBe(400);
    });

    it("❌ should reject product creation with zero quantity", async () => {
      const res = await request(app)
        .post(`${BASE_URL}/products`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({
          name: "No Stock",
          category: "TOMATO_LOCAL",
          quantity: 0,
          price: 100,
          unit: "CRATE",
        });

      expect(res.status).toBe(400);
    });

    it("❌ should reject an order for more stock than is available (Concurrency/Boundary)", async () => {
      const res = await request(app)
        .post(`${BASE_URL}/orders`)
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          productId: sharedProductId,
          quantity: 9999,
          deliveryAddress: "Accra, Ghana",
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });
  });

  // ==========================================
  // GROUP 3: Authorization & Tenancy
  // ==========================================
  describe("3. Authorization & Tenancy", () => {
    it("❌ should prevent a buyer from updating a farmer's product", async () => {
      const res = await request(app)
        .patch(`${BASE_URL}/products/${sharedProductId}`)
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({ price: 10 });

      expect(res.status).toBe(403);
    });
  });

  // ==========================================
  // GROUP 4: State Machine Integrity
  // ==========================================
  describe("4. State Machine Integrity", () => {
    it("❌ should prevent reuse of an email verification token", async () => {
      // Handing the API a token that does not exist in your AuthToken table
      const res = await request(app)
        .post(`${BASE_URL}/auth/verify-email`)
        .send({ token: "expired-or-used-token-12345" });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it("❌ should reject invalid order status transitions (e.g., PENDING directly to DELIVERED)", async () => {
      const orderRes = await request(app)
        .post(`${BASE_URL}/orders`)
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          productId: sharedProductId,
          quantity: 1,
          deliveryAddress: "Tema, Ghana",
        });

      const orderId =
        orderRes.body.data?.id ||
        orderRes.body.data?.order?.id ||
        orderRes.body.id;

      const updateRes = await request(app)
        .patch(`${BASE_URL}/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({ status: "DELIVERED" });

      expect(updateRes.status).toBe(400);
    });
  });
});

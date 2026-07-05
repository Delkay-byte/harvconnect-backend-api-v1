const request = require("supertest");
const app = require("../app");
const prisma = require("../config/prisma");
const resetDatabase = require("../test/helpers/resetDatabase.js");

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

describe("HarvConnect API - Order & Inventory Tests", () => {
  let farmerToken, buyerToken, testProduct, farmer, buyer;

  // Set up a pristine database state before running tests
  beforeAll(async () => {
    await resetDatabase();

    // 1. Create a Farmer
    const farmerRes = await request(app).post("/api/v1/auth/register").send({
      fullName: "Farmer Test",
      email: "farmer@test.com",
      phone: "+233240000001",
      password: "SecurePassword123@",
      role: "FARMER",
    });
    farmer = farmerRes.body.data.user;

    // Verify farmer email before login
    await verifyUserEmail("farmer@test.com");

    const farmerLogin = await request(app).post("/api/v1/auth/login").send({
      email: "farmer@test.com",
      password: "SecurePassword123@",
    });
    farmerToken = farmerLogin.body.data.token;

    // 2. Create a Buyer
    const buyerRes = await request(app).post("/api/v1/auth/register").send({
      fullName: "Buyer Test",
      email: "buyer@test.com",
      phone: "+233240000002",
      password: "SecurePassword123@",
      role: "BUYER",
    });
    buyer = buyerRes.body.data.user;

    // Verify buyer email before login
    await verifyUserEmail("buyer@test.com");

    const buyerLogin = await request(app).post("/api/v1/auth/login").send({
      email: "buyer@test.com",
      password: "SecurePassword123@",
    });
    buyerToken = buyerLogin.body.data.token;

    // 3. Create a Product (Initial Stock: 50)
    const productRes = await request(app)
      .post("/api/v1/products")
      .set("Authorization", `Bearer ${farmerToken}`)
      .send({
        name: "Fresh Tomatoes",
        description: "A crate of red tomatoes",
        price: 100.0,
        quantity: 50,
        category: "TOMATO_LOCAL",
        unit: "CRATE",
      });
    testProduct = productRes.body.data.product;
  }, 15000); // Give the setup a generous timeout

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/v1/orders (The Transaction Block)", () => {
    it("should create an order and instantly deduct from the product inventory", async () => {
      // The buyer orders 10 crates
      const orderRes = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          productId: testProduct.id,
          quantity: 10,
          deliveryAddress: "Accra Central",
        });

      expect(orderRes.status).toBe(201);
      expect(orderRes.body.success).toBe(true);
      expect(orderRes.body.data.status).toBe("PENDING");

      // Verify the inventory was actually deducted in the database
      const updatedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id },
      });

      // 50 initial - 10 ordered = 40 remaining
      expect(Number(updatedProduct.quantity)).toBe(40);
    });

    it("should block the order if the buyer requests more stock than available", async () => {
      const orderRes = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          productId: testProduct.id,
          quantity: 100, // Wants 100, but only 40 are left
          deliveryAddress: "Accra Central",
        });

      expect(orderRes.status).toBe(400);
      expect(orderRes.body.success).toBe(false);
      expect(orderRes.body.message).toMatch(/Insufficient stock/i);
    });
  });

  describe("PATCH /api/v1/orders/:id/status", () => {
    it("should allow the farmer to accept the order and prep for transport", async () => {
      // Grab the order we just created
      const order = await prisma.order.findFirst({ where: { buyerId: buyer.id } });

      const statusRes = await request(app)
        .patch(`/api/v1/orders/${order.id}/status`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({ status: "READY_FOR_TRANSPORT" });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.status).toBe("READY_FOR_TRANSPORT");
    });
  });
});
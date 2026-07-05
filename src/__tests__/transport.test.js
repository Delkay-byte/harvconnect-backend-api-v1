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

describe("HarvConnect - PostGIS Dispatch Engine", () => {
  let driverToken,
    farmerToken,
    buyerToken,
    orderId,
    driverId,
    farmerId,
    productId;

  beforeAll(async () => {
    await resetDatabase();

    // 1. Create a Farmer
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Farmer Test",
      email: "farmer@test.com",
      phone: "+233240000001",
      password: "SecurePassword123@",
      role: "FARMER",
    });

    const farmer = await prisma.user.findUnique({
      where: { email: "farmer@test.com" },
    });
    farmerId = farmer.id;

    // Verify farmer email before login
    await verifyUserEmail("farmer@test.com");

    const farmerLogin = await request(app).post("/api/v1/auth/login").send({
      email: "farmer@test.com",
      password: "SecurePassword123@",
    });
    farmerToken = farmerLogin.body.data.token;

    // Set farmer's location
    await request(app)
      .patch("/api/v1/profile/farmer")
      .set("Authorization", `Bearer ${farmerToken}`)
      .send({
        farmName: "Test Farm",
        latitude: 6.0,
        longitude: 0.5,
        address: "Accra, Ghana",
      });

    // 2. Create a Product
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
    productId = productRes.body.data.product.id;

    // 3. Create a Buyer
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Buyer Test",
      email: "buyer@test.com",
      phone: "+233240000002",
      password: "SecurePassword123@",
      role: "BUYER",
    });

    // Verify buyer email before login
    await verifyUserEmail("buyer@test.com");

    const buyerLogin = await request(app).post("/api/v1/auth/login").send({
      email: "buyer@test.com",
      password: "SecurePassword123@",
    });
    buyerToken = buyerLogin.body.data.token;

    const orderRes = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${buyerToken}`)
      .send({
        productId: productId,
        quantity: 10,
        deliveryAddress: "Accra Central",
      });

    if (!orderRes.body || !orderRes.body.data) {
      console.error("Order creation failed:", orderRes.body);
      throw new Error(
        `Order creation failed with status ${orderRes.status}: ` +
        JSON.stringify(orderRes.body || orderRes.text)
      );
    }

    orderId = orderRes.body.data.id;

    // 4. Create Driver 1
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Driver Test",
      email: "driver@test.com",
      phone: "+233240000003",
      password: "SecurePassword123@",
      role: "TRANSPORT",
      vehicleType: "TRUCK",
      capacity: 100,
    });

    // Verify driver email before login
    await verifyUserEmail("driver@test.com");

    const driver = await prisma.user.findUnique({
      where: { email: "driver@test.com" },
    });
    driverId = driver.id;

    const driverLogin = await request(app).post("/api/v1/auth/login").send({
      email: "driver@test.com",
      password: "SecurePassword123@",
    });
    driverToken = driverLogin.body.data.token;
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POSTGIS Dispatch Logic", () => {
    jest.setTimeout(15000);

    it("should auto-assign the nearest driver when order is set to READY_FOR_TRANSPORT", async () => {
      await request(app)
        .put("/api/v1/transport/status")
        .set("Authorization", `Bearer ${driverToken}`)
        .send({
          available: true,
          latitude: 6.0001,
          longitude: 0.5001,
          currentAddress: "Greater Accra",
        });

      await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({ status: "ACCEPTED" });

      const response = await request(app)
        .patch(`/api/v1/orders/${orderId}/status`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({ status: "READY_FOR_TRANSPORT" });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("IN_TRANSIT");
      expect(response.body.data.transporterId).toBe(driverId);
    });

    it("should move order to PENDING_DISPATCH when no driver is available", async () => {
      const orderRes = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          productId: productId,
          quantity: 5,
          deliveryAddress: "Tema, Ghana",
        });

      if (!orderRes.body || !orderRes.body.data) {
        console.error("Order creation failed:", orderRes.body);
        throw new Error(
          `Order creation failed with status ${orderRes.status}: ` +
          JSON.stringify(orderRes.body || orderRes.text)
        );
      }

      const newOrderId = orderRes.body.data.id;

      // Force driver offline
      await request(app)
        .put("/api/v1/transport/status")
        .set("Authorization", `Bearer ${driverToken}`)
        .send({
          available: false,
          latitude: 6.0001,
          longitude: 0.5001,
          currentAddress: "Greater Accra",
        });

      await request(app)
        .patch(`/api/v1/orders/${newOrderId}/status`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({ status: "ACCEPTED" });

      const response = await request(app)
        .patch(`/api/v1/orders/${newOrderId}/status`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({ status: "READY_FOR_TRANSPORT" });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("PENDING_DISPATCH");
      expect(response.body.data.transporterId).toBeNull();
    });

    it("should find the closest driver when multiple drivers are available", async () => {
      await request(app).post("/api/v1/auth/register").send({
        fullName: "Driver Two",
        email: "driver2b@test.com",
        phone: "+233240000004",
        password: "SecurePassword123@",
        role: "TRANSPORT",
        vehicleType: "TRUCK",
        capacity: 100,
      });

      // Verify driver2 email before login
      await verifyUserEmail("driver2b@test.com");

      const driver2 = await prisma.user.findUnique({
        where: { email: "driver2b@test.com" },
      });
      const driver2Id = driver2.id;

      const driver2Login = await request(app).post("/api/v1/auth/login").send({
        email: "driver2b@test.com",
        password: "SecurePassword123@",
      });
      const driver2Token = driver2Login.body.data.token;

      // Put Driver 2 extremely close to the farm
      await request(app)
        .put("/api/v1/transport/status")
        .set("Authorization", `Bearer ${driver2Token}`)
        .send({
          available: true,
          latitude: 6.00005,
          longitude: 0.50005,
          currentAddress: "Greater Accra",
        });

      // Put Driver 1 further away
      await request(app)
        .put("/api/v1/transport/status")
        .set("Authorization", `Bearer ${driverToken}`)
        .send({
          available: true,
          latitude: 6.01,
          longitude: 0.51,
          currentAddress: "Greater Accra",
        });

      const orderRes = await request(app)
        .post("/api/v1/orders")
        .set("Authorization", `Bearer ${buyerToken}`)
        .send({
          productId: productId,
          quantity: 5,
          deliveryAddress: "Accra Central",
        });

      if (!orderRes.body || !orderRes.body.data) {
        console.error("Order creation failed:", orderRes.body);
        throw new Error(
          `Order creation failed with status ${orderRes.status}: ` +
          JSON.stringify(orderRes.body || orderRes.text)
        );
      }

      const newOrderId = orderRes.body.data.id;

      await request(app)
        .patch(`/api/v1/orders/${newOrderId}/status`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({ status: "ACCEPTED" });

      const response = await request(app)
        .patch(`/api/v1/orders/${newOrderId}/status`)
        .set("Authorization", `Bearer ${farmerToken}`)
        .send({ status: "READY_FOR_TRANSPORT" });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("IN_TRANSIT");
      expect(response.body.data.transporterId).toBe(driver2Id); // The closer one wins
    });
  });
});

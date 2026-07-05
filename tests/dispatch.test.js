jest.setTimeout(30000);

const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../src/app");
const prisma = require("../src/config/prisma");
const resetDatabase = require("../src/test/helpers/resetDatabase");

describe("Transport Location API Integration", () => {
  let authToken;
  let userId;

  const email = `driver_${Date.now()}@harvconnect.com`;
  const password = "SecurePassword123@";

  beforeAll(async () => {
    await resetDatabase();
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName: "Integration Driver",
        email,
        phone: `+23324${Math.floor(1000000 + Math.random() * 9000000)}`,
        password: hashedPassword,
        role: "TRANSPORT",
        isVerified: true, // Skip email verification for integration tests
        transportProfile: {
          create: {
            vehicleType: "TRUCK",
            capacity: 200,
            isAvailable: false,
          },
        },
      },
      include: {
        transportProfile: true,
      },
    });

    userId = user.id;

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email,
      password,
    });

    expect(loginRes.status).toBe(200);

    authToken = loginRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should update transporter availability and PostGIS location", async () => {
    const response = await request(app)
      .put("/api/v1/transport/status")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        available: true,
        latitude: 6.125,
        longitude: 0.8025,
        currentAddress: "Test Zone",
        currentRegion: "Volta",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const profile = await prisma.transportProfile.findUnique({
      where: { userId },
    });

    expect(profile).not.toBeNull();
    expect(profile.isAvailable).toBe(true);
    expect(profile.currentLat).toBeCloseTo(6.125);
    expect(profile.currentLng).toBeCloseTo(0.8025);
    expect(profile.currentAddress).toBe("Test Zone");
    expect(profile.currentRegion).toBe("Volta");
    expect(profile.location).not.toBeNull();
  });
});

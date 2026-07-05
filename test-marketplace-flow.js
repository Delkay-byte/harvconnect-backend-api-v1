const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BASE_URL = "http://localhost:5000/api/v1";
const TEST_PASSWORD = "MarketPassword123!";

/**
 * Robust API helper with detailed error reporting
 */
const apiCall = async (endpoint, method, body = null, token = null) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json().catch(() => null);

    // Log failure details for debugging
    if (!res.ok) {
      console.error(`❌ API Call Failed: ${method} ${endpoint}`);
      console.error(`Status: ${res.status}`);
      console.error(`Payload:`, JSON.stringify(data, null, 2));
    }

    return { status: res.status, data };
  } catch (err) {
    console.error(`🔥 Network Error for ${endpoint}:`, err.message);
    return { status: 500, data: null };
  }
};

/**
 * Adapts to various API response wrappers (Deep-nested, shallow, or root)
 */
const safeExtractId = (response) => {
  if (!response) return null;

  // 1. Handles the current deep structure: { data: { product: { id: ... } } }
  if (response.data?.product?.id) return response.data.product.id;

  // 2. Handles standard nested structure: { data: { id: ... } }
  if (response.data?.id) return response.data.id;

  // 3. Handles root level: { id: ... }
  if (response.id) return response.id;

  return null;
};

const runMarketplaceTests = async () => {
  console.log("🚜 Starting HarvConnect Marketplace Integration Test...\n");

  const users = [
    { email: "farmer1@harv.com", role: "FARMER", name: "Saviour (Farmer)" },
    { email: "buyer1@harv.com", role: "BUYER", name: "Ama (Buyer)" },
    { email: "driver1@harv.com", role: "TRANSPORT", name: "Yaw (Driver)" },
  ];

  const tokens = {};
  let createdProductId = null;
  let createdOrderId = null;

  try {
    // 🧹 CLEANUP
    console.log("🧹 Scrubbing previous test records...");
    for (const u of users)
      await prisma.user.deleteMany({ where: { email: u.email } });

    // 1. BOOTSTRAP
    console.log("1️⃣ Bootstrapping users...");
    for (const u of users) {
      const regRes = await apiCall("/auth/register", "POST", {
        fullName: u.name,
        email: u.email,
        phone: `+233${Math.floor(100000000 + Math.random() * 900000000)}`,
        password: TEST_PASSWORD,
        role: u.role,
      });

      if (regRes.status !== 201) {
        throw new Error(
          `Registration failed for ${u.email}: ${JSON.stringify(regRes.data)}`,
        );
      }

      await prisma.user.update({
        where: { email: u.email },
        data: { isVerified: true },
      });

      const login = await apiCall("/auth/login", "POST", {
        email: u.email,
        password: TEST_PASSWORD,
      });

      console.log(
        `Login response for ${u.email}:`,
        login.status,
        login.data?.data?.token ? "has token" : "NO TOKEN",
      );

      if (login.status !== 200 || !login.data?.data?.token) {
        throw new Error(
          `Login failed for ${u.email}: ${JSON.stringify(login.data)}`,
        );
      }

      tokens[u.role] = tokens[u.role] || [];
      tokens[u.role].push(login.data.data.token);
    }

    // 2. PRODUCT WORKFLOW
    console.log("2️⃣ Testing Product lifecycle...");
    const prodRes = await apiCall(
      "/products",
      "POST",
      {
        name: "Akatsi Tomatoes",
        category: "TOMATO_LOCAL",
        quantity: 50,
        price: 120.5,
        unit: "CRATE",
      },
      tokens["FARMER"][0],
    );

    // DEBUG LINE: Add this temporarily
    console.log(
      "DEBUG: Raw Product API Response:",
      JSON.stringify(prodRes, null, 2),
    );

    if (prodRes.status !== 201) throw new Error("Product creation failed");
    createdProductId = safeExtractId(prodRes.data);

    if (!createdProductId) {
      throw new Error(
        "Product created, but no ID returned! Check your API response structure.",
      );
    }

    createdProductId = safeExtractId(prodRes.data);

    // ADD THIS CHECK:
    if (!createdProductId) {
      throw new Error(
        "Product created, but no ID returned! Check your API response structure.",
      );
    }
    console.log("✅ Product created successfully. ID:", createdProductId);

    if (prodRes.status !== 201) throw new Error("Product creation failed");
    createdProductId = safeExtractId(prodRes.data);

    // 3. ORDER WORKFLOW
    console.log("3️⃣ Testing Order placement...");
    const orderRes = await apiCall(
      "/orders",
      "POST",
      {
        productId: createdProductId,
        quantity: 2,
        deliveryAddress: "UCC Science Block",
      },
      tokens["BUYER"][0],
    );

    if (orderRes.status !== 201)
      throw new Error(
        `Order placement failed: ${JSON.stringify(orderRes.data)}`,
      );
    createdOrderId = safeExtractId(orderRes.data);

    // 4. LOGISTICS
    console.log("4️⃣ Testing Logistics...");
    const transRes = await apiCall(
      "/transport/status",
      "PUT",
      {
        available: true,
        latitude: 5.55,
        longitude: -0.22,
        currentAddress: "Accra Central",
      },
      tokens["TRANSPORT"][0],
    );

    if (transRes.status !== 200)
      throw new Error("Transport status update failed");

    console.log("\n🎉 ALL TESTS PASSED. The Marketplace flow is synchronized.");
  } catch (error) {
    console.error("\n❌ TEST SUITE CRASHED:", error.message);
  } finally {
    await prisma.$disconnect();
  }
};

runMarketplaceTests();

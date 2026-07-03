const prisma = require("../config/prisma");

async function testConnection() {
  try {
    console.log("⏳ Attempting to connect to Neon PostgreSQL...");
    await prisma.$connect();
    console.log("✅ Successfully connected to Neon PostgreSQL");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

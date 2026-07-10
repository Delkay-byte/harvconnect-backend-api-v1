const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function enablePostGIS() {
  try {
    console.log("Connecting to Render database...");
    // We are running a raw SQL command to turn the spatial mapping extension back on
    await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS postgis;");
    console.log("🚀 PostGIS extension successfully re-enabled!");
  } catch (error) {
    console.error("❌ Failed to enable extension:", error);
  } finally {
    await prisma.$disconnect();
  }
}

enablePostGIS();
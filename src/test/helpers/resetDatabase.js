/**
 * Database reset utility for test isolation
 * Uses PostgreSQL TRUNCATE CASCADE for fast, reliable cleanup
 * 
 * @requires NODE_ENV === "test"
 * @throws {Error} If called outside test environment or if reset fails
 */

const prisma = require("../../config/prisma");

const resetDatabase = async () => {
  // Safety guard: Only allow in test environment
  if (process.env.NODE_ENV !== "test") {
    throw new Error(
      "resetDatabase can only be called when NODE_ENV === 'test'"
    );
  }

  try {
    await prisma.$executeRaw`
      TRUNCATE TABLE "Order", "Product", "TransportProfile", "FarmerProfile", "BuyerProfile", "User" 
      RESTART IDENTITY CASCADE;
    `;
  } catch (error) {
    throw new Error(`Database reset failed: ${error.message}`);
  }
};

module.exports = resetDatabase;

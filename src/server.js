// src/server.js
const app = require("./app");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection before booting the server
    await prisma.$connect();
    console.log("🚀 Database connected successfully via Prisma.");

    app.listen(PORT, () => {
      console.log(`🚜 HarvConnect backend spinning up on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      "❌ Failed to start the server due to DB connection error:",
      error,
    );
    process.exit(1);
  }
}

startServer();

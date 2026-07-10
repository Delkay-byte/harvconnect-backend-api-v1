// src/server.js
require("dotenv/config");
const http = require("http");
const app = require("./app");
const prisma = require("./config/prisma");
const { setupSocketIO } = require("./utils/socket");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("🚀 Database connected successfully via Prisma.");

    const server = http.createServer(app);
    setupSocketIO(server);

    server.listen(PORT, () => {
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

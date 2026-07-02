require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
====================================
🚜 HarvConnect API Started
====================================
Environment : ${process.env.NODE_ENV || "development"}
Port        : ${PORT}
====================================
`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);

  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGINT", () => {
  console.log("\nShutting down server...");

  server.close(() => {
    process.exit(0);
  });
});

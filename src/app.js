// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const rootRouter = require("./routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/errorMiddleware"); // Ensure this is the centralized one
const notFound = require("./middleware/notFound");

const app = express();
app.disable("x-powered-by");

// 1. Security & Logging first
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

// 2. Body Parsers (MUST come before routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Routes
app.get("/", (req, res) => {
  res.json({ success: true, message: "Welcome to the HarvConnect API 🚜" });
});

app.use("/api/v1", rootRouter);

// 4. Error Handling (MUST come after routes)
app.use(notFound);
app.use(errorHandler);

module.exports = app;

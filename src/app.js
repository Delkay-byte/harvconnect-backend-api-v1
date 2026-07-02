const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const rootRouter = require("./routes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the HarvConnect API 🚜",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    message: "HarvConnect backend is running smoothly.",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1", rootRouter);

app.use(notFound);

app.use(errorHandler);

module.exports = app;

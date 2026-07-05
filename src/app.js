const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const swaggerSpecs = require("./config/swagger");
const { APP_VERSION } = require("./config/app");

const rootRouter = require("./routes");

const errorHandler = require("./middleware/errorMiddleware");
const notFound = require("./middleware/notFound");
const requestId = require("./middleware/requestId.middleware");

const app = express();

app.disable("x-powered-by");

/* -------------------------------------------------------------------------- */
/*                               Global Middleware                            */
/* -------------------------------------------------------------------------- */

app.use(helmet());
app.use(cors());
app.use(requestId);
app.use(
  morgan("[:req[id]] :method :url :status - :response-time ms", {
    skip: (req, res) => process.env.NODE_ENV === "test",
  })
);

// Rate limiting to prevent brute force and DDoS attacks
// Disabled during testing to avoid blocking test requests
if (process.env.NODE_ENV !== "test") {
  const rateLimit = require("express-rate-limit");

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  // Apply rate limiting to all API routes
  app.use("/api/", limiter);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------------------------------- */
/*                              Swagger Documentation                         */
/* -------------------------------------------------------------------------- */

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customSiteTitle: "HarvConnect API Documentation",
    customCss: `
      .swagger-ui .topbar {
        display: none;
      }
    `,
  }),
);

/* -------------------------------------------------------------------------- */
/*                                   Health                                   */
/* -------------------------------------------------------------------------- */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the HarvConnect API 🚜",
    documentation: "/api-docs",
  });
});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HarvConnect API is healthy.",
    data: {
      status: "ok",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      environment: process.env.NODE_ENV || "development",
    },
  });
});

/* -------------------------------------------------------------------------- */
/*                                   Routes                                   */
/* -------------------------------------------------------------------------- */

app.use("/api/v1", rootRouter);

/* -------------------------------------------------------------------------- */
/*                              Error Middleware                              */
/* -------------------------------------------------------------------------- */

app.use(notFound);
app.use(errorHandler);

module.exports = app;

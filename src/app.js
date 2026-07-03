const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");

const swaggerSpecs = require("./config/swagger");

const rootRouter = require("./routes");
const profileRoutes = require("./routes/profile.routes");
const orderRoutes = require("./routes/order.routes");

const errorHandler = require("./middleware/errorMiddleware");
const notFound = require("./middleware/notFound");

const app = express();

app.disable("x-powered-by");

/* -------------------------------------------------------------------------- */
/*                               Global Middleware                            */
/* -------------------------------------------------------------------------- */

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

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

/* -------------------------------------------------------------------------- */
/*                                   Routes                                   */
/* -------------------------------------------------------------------------- */

app.use("/api/v1", rootRouter);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/orders", orderRoutes);

/* -------------------------------------------------------------------------- */
/*                              Error Middleware                              */
/* -------------------------------------------------------------------------- */

app.use(notFound);
app.use(errorHandler);

module.exports = app;

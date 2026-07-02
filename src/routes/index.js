const express = require("express");
const rootRouter = express.Router();

// Import all sub-routers
const authRoutes = require("./auth.routes");
const farmerRoutes = require("./farmer.routes");
const buyerRoutes = require("./buyer.routes");
const productRoutes = require("./product.routes");
const orderRoutes = require("./order.routes");
const logisticsRoutes = require("./logistics.routes");
const recommendationRoutes = require("./recommendation.routes");

// Connect each router to its specific sub-path
rootRouter.use("/auth", authRoutes);
rootRouter.use("/farmers", farmerRoutes);
rootRouter.use("/buyers", buyerRoutes);
rootRouter.use("/products", productRoutes);
rootRouter.use("/orders", orderRoutes);
rootRouter.use("/logistics", logisticsRoutes);
rootRouter.use("/recommendations", recommendationRoutes);

module.exports = rootRouter;

const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const { findNearestAvailableDriver } = require("./transportService");
const DISPATCH_CONSTANTS = require("../constants/dispatch");
const Logger = require("../utils/logger");

const VALID_ORDER_TRANSITIONS = {
  PENDING: ["ACCEPTED", "READY_FOR_TRANSPORT", "CANCELLED", "REJECTED"],
  ACCEPTED: ["READY_FOR_TRANSPORT", "CANCELLED"],
  READY_FOR_TRANSPORT: ["IN_TRANSIT", "PENDING_DISPATCH", "CANCELLED"],
  PENDING_DISPATCH: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["DELIVERED", "CANCELLED"],
  DELIVERED: [], // Terminal state - no moving out of this
  CANCELLED: [], // Terminal state - no moving out of this
  REJECTED: [], // Terminal state - no moving out of this
};

const createOrder = async (buyerId, orderData) => {
  const { productId, quantity, deliveryAddress } = orderData;

  // We wrap the entire process in Prisma's $transaction block.
  // If anything throws an error inside this block, Postgres cancels the whole operation.
  return await prisma.$transaction(async (tx) => {
    // 1. Lock in the product and check the current reality of the inventory
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (Number(product.quantity) < quantity) {
      throw new AppError(
        `Insufficient stock. Only ${Number(product.quantity)} units available.`,
        400,
      );
    }

    // 2. The stock exists. Deduct it immediately before anyone else can grab it.
    await tx.product.update({
      where: { id: productId },
      data: {
        quantity: Number(product.quantity) - quantity, // Math happens safely inside the transaction
      },
    });

    // 3. Generate a readable order ID (e.g., "ORD-1690")
    const orderNumber = `ORD-${Math.floor(DISPATCH_CONSTANTS.ORDER_NUMBER_MIN + Math.random() * (DISPATCH_CONSTANTS.ORDER_NUMBER_MAX - DISPATCH_CONSTANTS.ORDER_NUMBER_MIN + 1))}`;

    // 4. Create the formal contract (The Order)
    const order = await tx.order.create({
      data: {
        orderNumber,
        buyerId,
        farmerId: product.farmerId,
        productId,
        quantity,
        totalPrice: Number(product.price) * quantity,
        pickupAddress: "FARMER_LOCATION_PENDING", // We can fetch this from the farmer's profile in a real query
        deliveryAddress,
        status: "PENDING",
      },
    });

    return order;
  });
};

const updateOrderStatus = async (orderId, userId, newStatus, userRole) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) throw new AppError("Order not found", 404);

  // State transition validation
  const allowedNextStates = VALID_ORDER_TRANSITIONS[order.status] || [];
  if (!allowedNextStates.includes(newStatus)) {
    throw new AppError(
      `Illegal state transition. Cannot move order from ${order.status} to ${newStatus}.`,
      400
    );
  }

  // Security check: Only the farmer who owns this order can accept or reject it
  if (userRole === "FARMER" && order.farmerId !== userId) {
    throw new AppError("Unauthorized to update this order", 403);
  }

  // If a farmer rejects an order (maybe the tomatoes rotted), we MUST give the inventory back.
  if (newStatus === "REJECTED" || newStatus === "CANCELLED") {
    return await prisma.$transaction(async (tx) => {
      // 1. Refund the stock
      await tx.product.update({
        where: { id: order.productId },
        data: { quantity: { increment: order.quantity } },
      });
      // 2. Mark order as rejected
      return await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });
    });
  }

  // NEW: Dispatch Logic - Triggered when farmer marks order as READY_FOR_TRANSPORT
  if (newStatus === "READY_FOR_TRANSPORT") {
    try {
      const driver = await findNearestAvailableDriver(orderId, DISPATCH_CONSTANTS.DEFAULT_DISPATCH_RADIUS_KM);

      if (driver) {
        // SUCCESS: Auto-assign the driver and move to IN_TRANSIT
        Logger.business("transporter_assigned", {
          orderId,
          transporterId: driver.userId,
          distanceKm: driver.distance_km,
        });
        return await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "IN_TRANSIT",
            transporterId: driver.userId,
            pickupAddress: order.pickupAddress,
          },
        });
      } else {
        // FALLBACK: No driver found within service radius
        Logger.warn("No transporters found for dispatch", {
          orderId,
          status: "PENDING_DISPATCH",
        });
        return await prisma.order.update({
          where: { id: orderId },
          data: { status: "PENDING_DISPATCH" },
        });
      }
    } catch (error) {
      Logger.error("Dispatch failed, reverting to READY_FOR_TRANSPORT", {
        orderId,
        error: error.message,
      });
      // If dispatch fails, still allow the order to be "READY" for manual pick-up
      return await prisma.order.update({
        where: { id: orderId },
        data: { status: "READY_FOR_TRANSPORT" },
      });
    }
  }

  // Otherwise, just update the status (e.g., PENDING -> ACCEPTED)
  return await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });
};

const getUserOrders = async (userId, role) => {
  // If they are a buyer, show their purchases. If a farmer, show their sales.
  const whereClause =
    role === "BUYER" ? { buyerId: userId } : { farmerId: userId };

  return await prisma.order.findMany({
    where: whereClause,
    include: {
      product: {
        select: { name: true, category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getOrderById = async (orderId, userId, userRole) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      product: { select: { name: true, category: true, imageUrl: true } },
      buyer: { select: { id: true, fullName: true, phone: true } },
      farmer: { select: { id: true, fullName: true, phone: true } },
      transporter: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          transportProfile: { select: { vehicleType: true } },
        },
      },
      tracking: true,
    },
  });

  if (!order) throw new AppError("Order not found", 404);

  const canAccess =
    order.buyerId === userId ||
    order.farmerId === userId ||
    order.transporterId === userId ||
    userRole === "ADMIN";
  if (!canAccess) throw new AppError("Access denied", 403);

  return order;
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getUserOrders,
  getOrderById,
};

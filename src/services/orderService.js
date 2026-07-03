const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

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
      throw new AppError(`Insufficient stock. Only ${Number(product.quantity)} units available.`, 400);
    }

    // 2. The stock exists. Deduct it immediately before anyone else can grab it.
    await tx.product.update({
      where: { id: productId },
      data: {
        quantity: Number(product.quantity) - quantity, // Math happens safely inside the transaction
      },
    });

    // 3. Generate a readable order ID (e.g., "ORD-1690")
    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

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
        data: { quantity: { increment: order.quantity } }
      });
      // 2. Mark order as rejected
      return await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus }
      });
    });
  }

  // Otherwise, just update the status (e.g., PENDING -> READY_FOR_TRANSPORT)
  return await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });
};

const getUserOrders = async (userId, role) => {
  // If they are a buyer, show their purchases. If a farmer, show their sales.
  const whereClause = role === "BUYER" ? { buyerId: userId } : { farmerId: userId };

  return await prisma.order.findMany({
    where: whereClause,
    include: {
      product: {
        select: { name: true, category: true } // Bring in some product details for the frontend
      }
    },
    orderBy: { createdAt: "desc" }, // Newest first
  });
};

module.exports = {
  createOrder,
  updateOrderStatus,
  getUserOrders,
};
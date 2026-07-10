const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const { getIO } = require("../utils/socket");

const EARTH_RADIUS_KM = 6371;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const getTracking = async (orderId, userId, userRole) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      buyerId: true,
      farmerId: true,
      transporterId: true,
      pickupAddress: true,
      deliveryAddress: true,
      buyer: { select: { id: true, fullName: true } },
      farmer: {
        select: {
          id: true,
          fullName: true,
          farmerProfile: { select: { latitude: true, longitude: true } },
        },
      },
      transporter: {
        select: {
          id: true,
          fullName: true,
          transportProfile: { select: { vehicleType: true } },
        },
      },
      product: { select: { name: true } },
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

const startTracking = async (orderId, userId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found", 404);
  if (order.transporterId !== userId) throw new AppError("You are not the assigned transporter for this order", 403);
  if (order.status !== "IN_TRANSIT") throw new AppError("Order is not in transit yet", 400);

  const tracking = await prisma.deliveryTracking.upsert({
    where: { orderId },
    create: {
      orderId,
      status: "PICKING_UP",
      startedAt: new Date(),
    },
    update: {
      status: "PICKING_UP",
      startedAt: new Date(),
    },
  });

  const io = getIO();
  if (io) {
    io.to(`order:${orderId}`).emit("tracking:status", {
      orderId,
      status: "PICKING_UP",
      message: "Transporter is heading to the farm for pickup",
    });
  }

  return tracking;
};

const markPickedUp = async (orderId, userId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found", 404);
  if (order.transporterId !== userId) throw new AppError("You are not the assigned transporter for this order", 403);

  const tracking = await prisma.deliveryTracking.upsert({
    where: { orderId },
    create: {
      orderId,
      status: "IN_TRANSIT",
      pickedUpAt: new Date(),
    },
    update: {
      status: "IN_TRANSIT",
      pickedUpAt: new Date(),
    },
  });

  const io = getIO();
  if (io) {
    io.to(`order:${orderId}`).emit("tracking:status", {
      orderId,
      status: "IN_TRANSIT",
      message: "Items picked up! En route to delivery address",
    });
  }

  return tracking;
};

const updateLocation = async (orderId, userId, lat, lng) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { buyerProfile: { select: { latitude: true, longitude: true } } } },
      farmer: { select: { farmerProfile: { select: { latitude: true, longitude: true } } } },
    },
  });
  if (!order) throw new AppError("Order not found", 404);
  if (order.transporterId !== userId) throw new AppError("You are not the assigned transporter for this order", 403);

  let deliveryLat = null;
  let deliveryLng = null;
  if (order.buyer?.buyerProfile) {
    deliveryLat = order.buyer.buyerProfile.latitude;
    deliveryLng = order.buyer.buyerProfile.longitude;
  }

  let farmerLat = null;
  let farmerLng = null;
  if (order.farmer?.farmerProfile) {
    farmerLat = order.farmer.farmerProfile.latitude;
    farmerLng = order.farmer.farmerProfile.longitude;
  }

  let etaMinutes = null;
  if (deliveryLat != null && deliveryLng != null) {
    const distKm = haversineKm(lat, lng, deliveryLat, deliveryLng);
    const avgSpeedKmph = 25;
    etaMinutes = Math.max(1, Math.round((distKm / avgSpeedKmph) * 60));
  }

  const tracking = await prisma.deliveryTracking.upsert({
    where: { orderId },
    create: { orderId, currentLat: lat, currentLng: lng, etaMinutes },
    update: { currentLat: lat, currentLng: lng, etaMinutes },
  });

  // Auto-detect when arriving soon (< 1km from delivery address)
  if (tracking.status === "IN_TRANSIT" && deliveryLat != null && deliveryLng != null) {
    const distToBuyer = haversineKm(lat, lng, deliveryLat, deliveryLng);
    if (distToBuyer <= 1) {
      await prisma.deliveryTracking.update({
        where: { orderId },
        data: { status: "ARRIVING_SOON" },
      });
      const ioInner = getIO();
      if (ioInner) {
        ioInner.to(`order:${orderId}`).emit("tracking:status", {
          orderId,
          status: "ARRIVING_SOON",
          message: "Transporter is arriving soon!",
        });
      }
    }
  }

  const io = getIO();
  if (io) {
    io.to(`order:${orderId}`).emit("tracking:update", {
      lat,
      lng,
      eta: etaMinutes,
      status: tracking.status,
      updatedAt: new Date().toISOString(),
    });
  }

  return tracking;
};

const markDelivered = async (orderId, userId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found", 404);
  if (order.transporterId !== userId) throw new AppError("You are not the assigned transporter for this order", 403);

  const [tracking] = await prisma.$transaction([
    prisma.deliveryTracking.update({
      where: { orderId },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: "DELIVERED" },
    }),
  ]);

  const io = getIO();
  if (io) {
    io.to(`order:${orderId}`).emit("tracking:status", {
      orderId,
      status: "DELIVERED",
      message: "Order has been delivered successfully!",
    });
  }

  return tracking;
};

module.exports = {
  getTracking,
  startTracking,
  markPickedUp,
  updateLocation,
  markDelivered,
};
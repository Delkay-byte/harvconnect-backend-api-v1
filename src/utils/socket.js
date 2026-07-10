const { Server } = require("socket.io");
const { verifyToken } = require("./jwt");
const prisma = require("../config/prisma");

let io = null;

function setupSocketIO(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });
      if (!user || !user.isActive) {
        return next(new Error("Account deactivated"));
      }
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] ${socket.userRole}:${socket.userId} connected`);

    socket.on("tracking:join", ({ orderId }) => {
      if (!orderId) return;
      socket.join(`order:${orderId}`);
      console.log(`[Socket] ${socket.userId} joined order:${orderId}`);
    });

    socket.on("tracking:leave", ({ orderId }) => {
      if (!orderId) return;
      socket.leave(`order:${orderId}`);
    });

    socket.on("tracking:location", async ({ orderId, lat, lng }) => {
      if (!orderId || lat == null || lng == null) return;
      io.to(`order:${orderId}`).emit("tracking:update", {
        lat,
        lng,
        updatedAt: new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] ${socket.userId} disconnected`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

module.exports = { setupSocketIO, getIO };
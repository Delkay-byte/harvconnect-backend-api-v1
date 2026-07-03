// src/services/authService.js
const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const { generateToken } = require("../utils/jwt");

const registerUser = async (userData) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: userData.email }, { phone: userData.phone }],
    },
  });

  if (existingUser) {
    throw new AppError("Email or Phone number is already registered.", 409);
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        role: userData.role,
      },
    });

    if (userData.role === "FARMER") {
      await tx.farmerProfile.create({ data: { userId: user.id } });
    } else if (userData.role === "BUYER") {
      await tx.buyerProfile.create({ data: { userId: user.id } });
    } else if (userData.role === "TRANSPORT") {
      await tx.transportProfile.create({
        data: {
          userId: user.id,
          vehicleType: userData.vehicleType,
          capacity: userData.capacity,
        },
      });
    }

    return user;
  });
};

const loginUser = async (credentials) => {
  // Look up the user exclusively by email
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  // Check if user exists and password matches
  if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
    throw new AppError("Invalid email or password.", 401);
  }

  // Generate the JWT
  const token = generateToken(user.id, user.role);

  return { user, token };
};

module.exports = {
  registerUser,
  loginUser,
};

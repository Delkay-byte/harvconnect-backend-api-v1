const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const { generateToken } = require("../utils/jwt");
const ROLES = require("../constants/roles");
const MESSAGES = require("../constants/messages");

const registerUser = async (userData) => {
  if (!userData?.email || !userData?.password || !userData?.role) {
    throw new AppError("Missing required fields", 400);
  }

  const VALID_ROLES = ["FARMER", "BUYER", "TRANSPORT"];

  if (!VALID_ROLES.includes(userData.role)) {
    throw new AppError("Invalid role provided", 400);
  }

  const email = userData.email.trim().toLowerCase();
  const phone = userData.phone?.trim();

  // I am using findFirst here as well to maintain consistency and prevent index mismatches
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    throw new AppError(MESSAGES.EMAIL_PHONE_EXISTS, 409);
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        fullName: userData.fullName?.trim(),
        email,
        phone,
        password: hashedPassword,
        role: userData.role?.toUpperCase(),
      },
    });

    if (userData.role === ROLES.FARMER) {
      await tx.farmerProfile.create({
        data: { userId: newUser.id },
      });
    }

    if (userData.role === ROLES.BUYER) {
      await tx.buyerProfile.create({
        data: { userId: newUser.id },
      });
    }

    if (userData.role === ROLES.TRANSPORT) {
      await tx.transportProfile.create({
        data: {
          userId: newUser.id,
          vehicleType: userData.vehicleType || "OTHER",
          capacity: Number(userData.capacity || 0),
        },
      });
    }

    return newUser;
  });

  const { password, ...safeUser } = user;

  return safeUser;
};

const loginUser = async (credentials) => {
  if (!credentials?.email || !credentials?.password) {
    throw new AppError("Missing credentials", 400);
  }

  const email = credentials.email.trim().toLowerCase();

  // I am changing this to findFirst to prevent edge-case index mismatch issues in Postgres
  const user = await prisma.user.findFirst({
    where: { email },
  });

  // I am checking if the user exists AND ensuring they haven't soft-deleted their account
  if (!user || user.isActive === false) {
    throw new AppError(MESSAGES.INVALID_CREDENTIALS, 401);
  }

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new AppError(MESSAGES.INVALID_CREDENTIALS, 401);
  }

  const token = generateToken(user.id, user.role);

  // I am updating the lastLogin timestamp to keep our analytics accurate
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const { password, ...safeUser } = user;

  return {
    user: safeUser,
    token,
  };
};

const deleteAccount = async (userId) => {
  // I am updating the user record to flip the active switch and stamp the exact time they left
  return prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });
};

module.exports = {
  registerUser,
  loginUser,
  deleteAccount,
};

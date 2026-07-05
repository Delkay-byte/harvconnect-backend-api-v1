const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const { generateToken } = require("../utils/jwt");
const ROLES = require("../constants/roles");
const MESSAGES = require("../constants/messages");

const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("./emailService");

const {
  generateVerificationToken,
  generateResetToken,
} = require("../utils/tokenService");

const registerUser = async (userData) => {
  if (!userData?.email || !userData?.password || !userData?.role) {
    throw new AppError("Missing required fields", 400);
  }

  const VALID_ROLES = [ROLES.FARMER, ROLES.BUYER, ROLES.TRANSPORT, ROLES.ADMIN];

  if (!VALID_ROLES.includes(userData.role)) {
    throw new AppError("Invalid role provided", 400);
  }

  const email = userData.email.trim().toLowerCase();
  const phone = userData.phone?.trim();

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    throw new AppError(MESSAGES.EMAIL_PHONE_EXISTS, 409);
  }

  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        fullName: userData.fullName?.trim(),
        email,
        phone,
        password: hashedPassword,
        role: userData.role.toUpperCase(),
        isVerified: false,
      },
    });

    if (userData.role === ROLES.FARMER) {
      await tx.farmerProfile.create({ data: { userId: newUser.id } });
    }

    if (userData.role === ROLES.BUYER) {
      await tx.buyerProfile.create({ data: { userId: newUser.id } });
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

  const token = generateVerificationToken();

  await prisma.authToken.create({
    data: {
      userId: user.id,
      token,
      type: "VERIFY_EMAIL",
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  });

  // HACKATHON_DEMO_MODE: Skip email verification for demo purposes
  if (process.env.HACKATHON_DEMO_MODE === "true") {
    console.log(`[DEMO MODE] Skipping email. User auto-verified.`);

    // Instantly verify them in the database so they can log in immediately
    await prisma.user.update({
      where: { email: user.email },
      data: { isVerified: true, emailVerifiedAt: new Date() },
    });

    const { password, ...safeUser } = user;
    return { ...safeUser, isVerified: true };
  }

  // Fire-and-forget email sending with error handling to prevent server crash
  sendVerificationEmail(user.email, token).catch((err) => {
    console.error("[EMAIL_SEND_FAILED]", err.message);
  });

  const { password, ...safeUser } = user;

  return safeUser;
};

const loginUser = async (credentials) => {
  if (!credentials?.email || !credentials?.password) {
    throw new AppError("Missing credentials", 400);
  }

  const email = credentials.email.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user || user.isActive === false) {
    throw new AppError(MESSAGES.INVALID_CREDENTIALS, 401);
  }

  if (!user.isVerified) {
    throw new AppError("Email not verified", 403);
  }

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new AppError(MESSAGES.INVALID_CREDENTIALS, 401);
  }

  const token = generateToken(user.id, user.role);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const { password, ...safeUser } = user;

  return { user: safeUser, token };
};

const verifyEmail = async (token) => {
  const record = await prisma.authToken.findFirst({
    where: {
      token,
      type: "VERIFY_EMAIL",
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) throw new AppError("Invalid or expired token", 400);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });

    await tx.authToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
  });

  return true;
};

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const token = generateResetToken();

  await prisma.authToken.create({
    data: {
      userId: user.id,
      token,
      type: "RESET_PASSWORD",
      expiresAt: new Date(Date.now() + 1000 * 60 * 15),
    },
  });

  sendPasswordResetEmail(email, token);
};

const resetPassword = async (token, newPassword) => {
  const record = await prisma.authToken.findFirst({
    where: {
      token,
      type: "RESET_PASSWORD",
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) throw new AppError("Invalid or expired token", 400);

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: record.userId },
      data: { password: hashed },
    });

    await tx.authToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
  });

  return true;
};

const deleteAccount = async (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });
};

const resendVerification = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return;
  }

  if (user.isVerified) {
    return;
  }

  await prisma.authToken.deleteMany({
    where: {
      userId: user.id,
      type: "VERIFY_EMAIL",
      usedAt: null,
    },
  });

  const token = generateVerificationToken();

  await prisma.authToken.create({
    data: {
      userId: user.id,
      token,
      type: "VERIFY_EMAIL",
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    },
  });

  await sendVerificationEmail(user.email, token);
};

const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isVerified: true,
      emailVerifiedAt: true,
      createdAt: true,
      buyerProfile: true,
      farmerProfile: true,
      transportProfile: true,
    },
  });

  if (!user || user.isActive === false) {
    throw new AppError(MESSAGES.USER_NOT_FOUND, 404);
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  deleteAccount,
  getUserById,
  resendVerification,
};

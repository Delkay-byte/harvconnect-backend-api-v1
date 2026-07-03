const prisma = require("../config/prisma");

const upsertFarmerProfile = async (userId, updateData) => {
  const data = {};

  if (updateData.farmName !== undefined) {
    data.farmName = updateData.farmName.trim();
  }

  if (updateData.bio !== undefined) {
    data.bio = updateData.bio?.trim() || null;
  }

  if (updateData.address !== undefined) {
    data.address = updateData.address?.trim() || null;
  }

  if (updateData.latitude !== undefined) {
    data.latitude = updateData.latitude;
  }

  if (updateData.longitude !== undefined) {
    data.longitude = updateData.longitude;
  }

  return prisma.farmerProfile.upsert({
    where: {
      userId,
    },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
};

const upsertBuyerProfile = async (userId, updateData) => {
  const data = {};

  if (updateData.deliveryAddress !== undefined) {
    data.deliveryAddress = updateData.deliveryAddress?.trim() || null;
  }

  if (updateData.latitude !== undefined) {
    data.latitude = updateData.latitude;
  }

  if (updateData.longitude !== undefined) {
    data.longitude = updateData.longitude;
  }

  return prisma.buyerProfile.upsert({
    where: {
      userId,
    },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
};

module.exports = {
  upsertFarmerProfile,
  upsertBuyerProfile,
};

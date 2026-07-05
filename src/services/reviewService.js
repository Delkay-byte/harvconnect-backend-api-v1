const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const Logger = require("../utils/logger");

const createReview = async (buyerId, farmerId, rating, comment) => {
  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new AppError("Rating must be between 1 and 5", 400);
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: {
      buyerId_farmerId: {
        buyerId,
        farmerId,
      },
    },
  });

  if (existingReview) {
    // Update existing review
    const updatedReview = await prisma.review.update({
      where: { id: existingReview.id },
      data: { rating, comment },
    });

    Logger.info("Review updated", { reviewId: updatedReview.id, rating }, null);
    return updatedReview;
  }

  // Create new review
  const review = await prisma.review.create({
    data: {
      buyerId,
      farmerId,
      rating,
      comment,
    },
  });

  Logger.info("Review created", { reviewId: review.id, rating }, null);
  return review;
};

const getFarmerReviews = async (farmerId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { farmerId },
      include: {
        buyer: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { farmerId } }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getFarmerAverageRating = async (farmerId) => {
  const result = await prisma.review.aggregate({
    where: { farmerId },
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
  });

  return {
    averageRating: result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : 0,
    totalReviews: result._count.rating,
  };
};

const getBuyerReviews = async (buyerId) => {
  const reviews = await prisma.review.findMany({
    where: { buyerId },
    include: {
      farmer: {
        select: {
          id: true,
          fullName: true,
          farmerProfile: {
            select: {
              farmName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

module.exports = {
  createReview,
  getFarmerReviews,
  getFarmerAverageRating,
  getBuyerReviews,
};

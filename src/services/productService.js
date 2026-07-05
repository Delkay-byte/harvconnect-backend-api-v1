const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

const SORT_OPTIONS = Object.freeze({
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  quantity: { quantity: "desc" },
});

const buildProductFilters = (queryParams) => {
  const {
    page = 1,
    limit = 10,
    category,
    minPrice,
    maxPrice,
    search,
    sort = "newest",
  } = queryParams;

  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const take = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));
  const skip = (currentPage - 1) * take;

  const normalizedCategory = category?.trim().toUpperCase();
  const cleanSearch = search?.trim();
  const normalizedSort = sort?.trim().toLowerCase() || "newest";

  const whereConditions = {
    available: true,
  };

  if (normalizedCategory) {
    whereConditions.category = normalizedCategory;
  }

  if (minPrice || maxPrice) {
    whereConditions.price = {};

    if (minPrice) {
      whereConditions.price.gte = parseFloat(minPrice);
    }

    if (maxPrice) {
      whereConditions.price.lte = parseFloat(maxPrice);
    }
  }

  if (cleanSearch) {
    whereConditions.OR = [
      {
        name: {
          contains: cleanSearch,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: cleanSearch,
          mode: "insensitive",
        },
      },
    ];
  }

  const orderBy = SORT_OPTIONS[normalizedSort] || SORT_OPTIONS.newest;

  return {
    whereConditions,
    orderBy,
    skip,
    take,
    currentPage,
  };
};

const createProduct = async (userId, productData) => {
  return prisma.product.create({
    data: {
      name: productData.name.trim(),
      category: productData.category.trim().toUpperCase(),
      quantity: productData.quantity,
      price: productData.price,
      unit: productData.unit.trim().toUpperCase(),
      description: productData.description?.trim() || null,
      harvestDate: productData.harvestDate
        ? new Date(productData.harvestDate)
        : null,
      imageUrl: productData.imageUrl?.trim() || null,
      farmerId: userId,
      available: true,
    },
  });
};

const getAllProducts = async (queryParams) => {
  const { whereConditions, orderBy, skip, take, currentPage } =
    buildProductFilters(queryParams);

  const [products, totalCount] = await prisma.$transaction([
    prisma.product.findMany({
      where: whereConditions,
      include: {
        farmer: {
          select: {
            fullName: true,
            phone: true,
            farmerProfile: {
              select: {
                farmName: true,
                latitude: true,
                longitude: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy,
      skip,
      take,
    }),
    prisma.product.count({
      where: whereConditions,
    }),
  ]);

  return {
    products,
    meta: {
      totalItems: totalCount,
      currentPage,
      totalPages: Math.max(Math.ceil(totalCount / take), 1),
      perPage: take,
    },
  };
};

const getProductById = async (productId) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      available: true,
    },
    include: {
      farmer: {
        select: {
          fullName: true,
          phone: true,
          farmerProfile: {
            select: {
              farmName: true,
              latitude: true,
              longitude: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    throw new AppError("Product listing not found or unavailable.", 404);
  }

  return product;
};

const updateProduct = async (productId, userId, updateData) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("Product listing not found.", 404);
  }

  if (product.farmerId !== userId) {
    throw new AppError("Unauthorized action.", 403);
  }

  const data = {};

  if (updateData.name !== undefined) {
    data.name = updateData.name.trim();
  }

  if (updateData.category !== undefined) {
    data.category = updateData.category.trim().toUpperCase();
  }

  if (updateData.price !== undefined) {
    data.price = updateData.price;
  }

  if (updateData.quantity !== undefined) {
    data.quantity = updateData.quantity;
  }

  if (updateData.unit !== undefined) {
    data.unit = updateData.unit.trim().toUpperCase();
  }

  if (updateData.description !== undefined) {
    data.description = updateData.description?.trim() || null;
  }

  if (updateData.harvestDate === null) {
    data.harvestDate = null;
  } else if (updateData.harvestDate !== undefined) {
    data.harvestDate = new Date(updateData.harvestDate);
  }

  if (updateData.imageUrl !== undefined) {
    data.imageUrl = updateData.imageUrl?.trim() || null;
  }

  if (updateData.available !== undefined) {
    data.available = updateData.available;
  }

  return prisma.product.update({
    where: {
      id: productId,
    },
    data,
  });
};

const softDeleteProduct = async (productId, userId) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("Product listing not found.", 404);
  }

  if (product.farmerId !== userId) {
    throw new AppError("Unauthorized action.", 403);
  }

  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      available: false,
    },
  });

  return {
    success: true,
  };
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  softDeleteProduct,
};

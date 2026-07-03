const productService = require("../services/productService");
const asyncHandler = require("../utils/asyncHandler");

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "Product created successfully.",
    data: { product },
  });
});

const getProducts = asyncHandler(async (req, res) => {
  // Forward query parameters straight to the service orchestrator
  const { products, meta } = await productService.getAllProducts(req.query);

  res.status(200).json({
    success: true,
    message: "Marketplace products retrieved successfully.",
    data: { products, meta },
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Product detailed insight pulled successfully.",
    data: { product },
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.user.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Product entry modified successfully.",
    data: { product },
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.softDeleteProduct(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: "Product removed from active marketplace view successfully.",
    data: null,
  });
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};

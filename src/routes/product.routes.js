const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const {
  validateCreateProduct,
  validateUpdateProduct,
} = require("../validators/product.validator");

const router = express.Router();

router.use(authMiddleware);

// Open matching pipelines
router.get("/", getProducts);
router.get("/:id", getProduct);

// Farmer ownership protected entries
router.post("/", authorize("FARMER"), validateCreateProduct, createProduct);
router.patch("/:id", authorize("FARMER"), validateUpdateProduct, updateProduct);
router.delete("/:id", authorize("FARMER"), deleteProduct);

module.exports = router;

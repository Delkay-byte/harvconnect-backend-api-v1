/**
 * Factory for creating test orders
 */

const request = require("supertest");
const createFarmer = require("./farmerFactory");
const createBuyer = require("./buyerFactory");

const createOrder = async (overrides = {}) => {
  const timestamp = Date.now();
  
  // Create farmer with product
  const farmer = await createFarmer();
  
  const productData = {
    name: `Test Product ${timestamp}`,
    description: "Test product description",
    price: 100.0,
    quantity: 50,
    category: "TOMATO_LOCAL",
    unit: "CRATE",
  };

  const productRes = await request(app)
    .post("/api/v1/products")
    .set("Authorization", `Bearer ${farmer.token}`)
    .send(productData);

  if (productRes.status !== 201) {
    throw new Error(`Failed to create product: ${JSON.stringify(productRes.body)}`);
  }

  const product = productRes.body.data.product;

  // Create buyer
  const buyer = await createBuyer();

  // Create order
  const defaultOrderData = {
    productId: product.id,
    quantity: 10,
    deliveryAddress: "Test Address",
  };

  const orderData = { ...defaultOrderData, ...overrides };

  const orderRes = await request(app)
    .post("/api/v1/orders")
    .set("Authorization", `Bearer ${buyer.token}`)
    .send(orderData);

  if (orderRes.status !== 201) {
    throw new Error(`Failed to create order: ${JSON.stringify(orderRes.body)}`);
  }

  return {
    order: orderRes.body.data,
    product,
    farmer,
    buyer,
  };
};

module.exports = createOrder;
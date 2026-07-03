const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "HarvConnect API",
      version: "1.0.0",
      description:
        "Comprehensive REST API documentation for the HarvConnect agricultural marketplace platform.",
      contact: {
        name: "HarvConnect Team",
      },
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
    ],

    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "Orders",
        description: "Order management and status tracking",
      },
      {
        name: "Profile",
        description: "Farmer and Buyer profile management",
      },
      {
        name: "Products",
        description: "Marketplace product management",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Something went wrong.",
            },
          },
        },

        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Request completed successfully.",
            },
          },
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],

    paths: {
      // ===================================================================
      // AUTH
      // ===================================================================

      "/api/v1/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["fullName", "email", "phone", "password", "role"],
                  properties: {
                    fullName: {
                      type: "string",
                      example: "Saviour Amegayie",
                    },
                    email: {
                      type: "string",
                      example: "amegayiesaviour@gmail.com",
                    },
                    phone: {
                      type: "string",
                      example: "+233241234567",
                    },
                    password: {
                      type: "string",
                      example: "143@Saviour",
                    },
                    role: {
                      type: "string",
                      enum: ["FARMER", "BUYER", "TRANSPORT"],
                      example: "FARMER",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "User registered successfully.",
            },
            400: {
              description: "Validation failed.",
            },
          },
        },
      },

      "/api/v1/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Authenticate user",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: {
                      type: "string",
                      example: "buyer@example.com",
                    },
                    password: {
                      type: "string",
                      example: "Buyer@123",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful.",
            },
            401: {
              description: "Invalid credentials.",
            },
          },
        },
      },

      "/api/v1/auth/account": {
        delete: {
          tags: ["Auth"],
          summary: "Deactivate user account (Soft Delete)",
          description:
            "Deactivates the currently authenticated user's account. This prevents future logins but preserves historical transaction data.",
          security: [
            {
              bearerAuth: [],
            },
          ],
          responses: {
            200: {
              description: "Account successfully deactivated.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example:
                          "Your account has been successfully deleted. We are sorry to see you go.",
                      },
                    },
                  },
                },
              },
            },
            401: {
              description:
                "Unauthorized. Token missing, invalid, or account already deactivated.",
            },
          },
        },
      },

      // ===================================================================
      // ORDERS
      // ===================================================================

      "/api/v1/orders": {
        get: {
          tags: ["Orders"],
          summary: "Get user's orders",
          description: "Retrieves orders for the authenticated user (as buyer or farmer).",
          security: [
            {
              bearerAuth: [],
            },
          ],
          responses: {
            200: {
              description: "Orders retrieved successfully.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "array",
                        items: {
                          type: "object",
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "Unauthorized. Token missing or invalid.",
            },
          },
        },

        post: {
          tags: ["Orders"],
          summary: "Place a new order",
          description: "Creates a new order for a product. Requires BUYER role.",
          security: [
            {
              bearerAuth: [],
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["productId", "quantity", "deliveryAddress"],
                  properties: {
                    productId: {
                      type: "string",
                      format: "uuid",
                      example: "123e4567-e89b-12d3-a456-426614174000",
                    },
                    quantity: {
                      type: "integer",
                      example: 10,
                    },
                    deliveryAddress: {
                      type: "string",
                      example: "Accra Central, Ghana",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Order created successfully.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          orderNumber: { type: "string", example: "ORD-1234" },
                          status: { type: "string", example: "PENDING" },
                          quantity: { type: "integer" },
                          totalPrice: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: "Validation failed or insufficient stock.",
            },
            403: {
              description: "Only buyers can place orders.",
            },
            404: {
              description: "Product not found.",
            },
          },
        },
      },

      "/api/v1/orders/{id}/status": {
        patch: {
          tags: ["Orders"],
          summary: "Update order status",
          description: "Allows farmers to accept/reject orders or update status.",
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "UUID of the order.",
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: {
                      type: "string",
                      enum: [
                        "PENDING",
                        "ACCEPTED",
                        "REJECTED",
                        "READY_FOR_TRANSPORT",
                        "IN_TRANSIT",
                        "DELIVERED",
                        "CANCELLED",
                      ],
                      example: "READY_FOR_TRANSPORT",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Order status updated successfully.",
            },
            403: {
              description: "Unauthorized to update this order.",
            },
            404: {
              description: "Order not found.",
            },
          },
        },
      },

      // ===================================================================
      // FARMER PROFILE
      // ===================================================================

      "/api/v1/profile/farmer": {
        patch: {
          tags: ["Profile"],
          summary: "Create or update farmer profile",
          description:
            "Requires FARMER role. Creates the profile if it doesn't exist, otherwise updates it.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    farmName: {
                      type: "string",
                      example: "Amegayie Organic Farms",
                    },
                    bio: {
                      type: "string",
                      example:
                        "Specializing in premium vegetables and sustainable farming.",
                    },
                    address: {
                      type: "string",
                      example: "Akatsi Market Bypass",
                    },
                    latitude: {
                      type: "number",
                      format: "float",
                      example: 6.1304,
                    },
                    longitude: {
                      type: "number",
                      format: "float",
                      example: 0.8021,
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Farmer profile updated.",
            },
            400: {
              description: "Validation failed.",
            },
            403: {
              description: "Only farmers may access this endpoint.",
            },
          },
        },
      },

      // ===================================================================
      // BUYER PROFILE
      // ===================================================================

      "/api/v1/profile/buyer": {
        patch: {
          tags: ["Profile"],
          summary: "Create or update buyer profile",
          description:
            "Requires BUYER role. Creates the profile if it doesn't exist, otherwise updates it.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    deliveryAddress: {
                      type: "string",
                      example: "Agbogbloshie Market Complex, Accra",
                    },
                    latitude: {
                      type: "number",
                      format: "float",
                      example: 5.5502,
                    },
                    longitude: {
                      type: "number",
                      format: "float",
                      example: -0.2224,
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Buyer profile updated.",
            },
            400: {
              description: "Validation failed.",
            },
            403: {
              description: "Only buyers may access this endpoint.",
            },
          },
        },
      },

      // ===================================================================
      // PRODUCTS
      // ===================================================================

      "/api/v1/products": {
        get: {
          tags: ["Products"],
          summary: "Retrieve marketplace products",
          description:
            "Returns paginated marketplace products with filtering, searching and sorting support.",
          parameters: [
            {
              name: "page",
              in: "query",
              schema: {
                type: "integer",
                default: 1,
              },
            },
            {
              name: "limit",
              in: "query",
              schema: {
                type: "integer",
                default: 10,
              },
            },
            {
              name: "category",
              in: "query",
              schema: {
                type: "string",
                example: "TOMATO_LOCAL",
              },
            },
            {
              name: "search",
              in: "query",
              schema: {
                type: "string",
                example: "fresh tomatoes",
              },
            },
            {
              name: "minPrice",
              in: "query",
              schema: {
                type: "number",
              },
            },
            {
              name: "maxPrice",
              in: "query",
              schema: {
                type: "number",
              },
            },
            {
              name: "sort",
              in: "query",
              schema: {
                type: "string",
                enum: [
                  "newest",
                  "oldest",
                  "price_asc",
                  "price_desc",
                  "quantity",
                ],
                default: "newest",
              },
            },
          ],
          responses: {
            200: {
              description: "Marketplace products retrieved successfully.",
            },
          },
        },

        post: {
          tags: ["Products"],
          summary: "Create a marketplace product",
          description: "Requires FARMER role.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "category", "quantity", "price", "unit"],
                  properties: {
                    name: {
                      type: "string",
                      example: "Akatsi Fresh Tomatoes",
                    },
                    category: {
                      type: "string",
                      example: "TOMATO_LOCAL",
                    },
                    quantity: {
                      type: "number",
                      example: 15,
                    },
                    price: {
                      type: "number",
                      example: 45.5,
                    },
                    unit: {
                      type: "string",
                      example: "CRATE",
                    },
                    description: {
                      type: "string",
                      example:
                        "Freshly harvested premium tomatoes from Akatsi.",
                    },
                    harvestDate: {
                      type: "string",
                      format: "date-time",
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Product created successfully.",
            },
            400: {
              description: "Validation failed.",
            },
            403: {
              description: "Only farmers may create products.",
            },
          },
        },
      },

      // ===================================================================
      // PRODUCTS(id)
      // ===================================================================

      "/api/v1/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Retrieve a single marketplace product",
          description:
            "Returns the details of a single available marketplace product.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "UUID of the product.",
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            200: {
              description: "Product retrieved successfully.",
            },
            404: {
              description: "Product not found.",
            },
          },
        },

        patch: {
          tags: ["Products"],
          summary: "Update a marketplace product",
          description:
            "Requires FARMER role. The authenticated farmer must own the product being updated.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "UUID of the product.",
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      example: "Fresh Premium Tomatoes",
                    },
                    category: {
                      type: "string",
                      enum: [
                        "TOMATO_LOCAL",
                        "TOMATO_HYBRID",
                        "PEPPER",
                        "OKRA",
                        "GARDEN_EGGS",
                        "CABBAGE",
                        "LETTUCE",
                        "CUCUMBER",
                        "ONION",
                      ],
                    },
                    quantity: {
                      type: "number",
                      example: 20,
                    },
                    price: {
                      type: "number",
                      example: 50.0,
                    },
                    unit: {
                      type: "string",
                      enum: ["KG", "BAG", "CRATE", "BUNCH", "BOX", "PIECE"],
                    },
                    description: {
                      type: "string",
                      example:
                        "Updated premium tomatoes harvested this morning.",
                    },
                    harvestDate: {
                      type: "string",
                      format: "date-time",
                      example: "2026-07-03T17:30:00.000Z",
                    },
                    imageUrl: {
                      type: "string",
                      example: "https://example.com/uploads/tomatoes.jpg",
                    },
                    available: {
                      type: "boolean",
                      example: true,
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Product updated successfully.",
            },
            400: {
              description: "Validation failed.",
            },
            403: {
              description: "Unauthorized. You do not own this product.",
            },
            404: {
              description: "Product not found.",
            },
          },
        },

        delete: {
          tags: ["Products"],
          summary: "Delete a marketplace product",
          description:
            "Requires FARMER role. Performs a soft delete by marking the product as unavailable.",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "UUID of the product.",
              schema: {
                type: "string",
                format: "uuid",
              },
            },
          ],
          responses: {
            200: {
              description: "Product deleted successfully.",
            },
            403: {
              description: "Unauthorized. You do not own this product.",
            },
            404: {
              description: "Product not found.",
            },
          },
        },
      },
    },
  },

  apis: [],
};

module.exports = swaggerJsdoc(options);

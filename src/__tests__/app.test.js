const request = require("supertest");
const app = require("../app");

describe("HarvConnect API - Sanity Tests", () => {
  describe("GET /", () => {
    it("should return 200 and the welcome message", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        success: true,
        message: "Welcome to the HarvConnect API 🚜",
        documentation: "/api-docs",
      });
    });
  });

  describe("Unknown Routes", () => {
    it("should return 404 for routes that do not exist", async () => {
      const response = await request(app).get("/api/v1/ghost-route");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});

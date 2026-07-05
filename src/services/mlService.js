// src/services/mlService.js

const axios = require("axios");
const AppError = require("../utils/AppError");

const mlClient = axios.create({
  baseURL: process.env.ML_API_URL,
  timeout: 10000,
});

const getRecommendations = async (commodity, lat, lon) => {
  try {
    const { data } = await mlClient.get("/match", {
      params: {
        commodity,
        lat,
        lon,
      },
    });

    return data;
  } catch (error) {
    if (error.response) {
      throw new AppError(
        `ML service responded with status ${error.response.status}.`,
        502,
      );
    }

    if (error.request) {
      throw new AppError(
        "ML recommendation service is currently unavailable.",
        503,
      );
    }

    throw new AppError("Failed to retrieve recommendations.", 500);
  }
};

module.exports = {
  getRecommendations,
};

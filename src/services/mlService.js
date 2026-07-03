// src/services/mlService.js
const axios = require("axios");
const AppError = require("../utils/AppError");

const getRecommendations = async (commodity, lat, lon) => {
  try {
    const response = await axios.get(`${process.env.ML_API_URL}/match`, {
      params: { commodity, lat, lon },
    });
    return response.data;
  } catch (error) {
    throw new AppError("Failed to fetch recommendations from ML engine", 502);
  }
};

module.exports = { getRecommendations };

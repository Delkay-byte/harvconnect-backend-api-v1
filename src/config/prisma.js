// src/config/prisma.js
require("dotenv").config(); // Ensures environment variables are loaded for custom scripts
const { PrismaClient } = require("@prisma/client");

// The classic engine automatically looks for process.env.DATABASE_URL
const prisma = new PrismaClient();

module.exports = prisma;

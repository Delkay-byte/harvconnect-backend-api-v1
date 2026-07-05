// src/models/authTokens.model.js
const { DataTypes } = require("sequelize"); // adjust if Prisma used differently

module.exports = (sequelize) => {
  const AuthToken = sequelize.define("AuthToken", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("VERIFY_EMAIL", "RESET_PASSWORD"),
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    usedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  return AuthToken;
};

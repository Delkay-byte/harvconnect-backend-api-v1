const Logger = require("../utils/logger");

const MOMO_NETWORKS = ["MTN", "Vodafone", "AirtelTigo"];

const processMomoPayment = async (paymentData) => {
  const { phoneNumber, amount, network, reference } = paymentData;

  // Validate network
  if (!MOMO_NETWORKS.includes(network)) {
    throw new Error(`Invalid network. Supported networks: ${MOMO_NETWORKS.join(", ")}`);
  }

  // Validate amount
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  // Validate phone number (basic Ghana format check)
  const phoneRegex = /^(\+233|0)?[0-9]{9}$/;
  if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
    throw new Error("Invalid phone number format");
  }

  // Artificial delay between 2 and 3 seconds
  const delay = 2000 + Math.random() * 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Generate mock transaction data
  const transactionId = `MOMO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const result = {
    transactionId,
    network,
    amount,
    currency: "GHS",
    status: "COMPLETED",
    timestamp: new Date().toISOString(),
    reference: reference || transactionId,
    phoneNumber,
  };

  Logger.info("Mock MoMo payment processed", { transactionId, amount, network }, null);

  return result;
};

module.exports = {
  processMomoPayment,
  MOMO_NETWORKS,
};

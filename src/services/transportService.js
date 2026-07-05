const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const DISPATCH_CONSTANTS = require("../constants/dispatch");
const Logger = require("../utils/logger");

/**
 * Find the nearest available transporter using PostGIS.
 */
const findNearestAvailableDriver = async (orderId, maxDistanceKm = DISPATCH_CONSTANTS.DEFAULT_DISPATCH_RADIUS_KM) => {
  // Pull the order along with the associated farmer profile data
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      farmer: {
        include: {
          farmerProfile: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError("Order not found.", 404);
  }

  const farmerProfile = order.farmer?.farmerProfile;

  // Bail out early if the farmer hasn't set their spatial coordinates yet
  if (
    !farmerProfile ||
    farmerProfile.latitude == null ||
    farmerProfile.longitude == null
  ) {
    throw new AppError(
      "Farmer location missing. Please update the farm profile before dispatch.",
      400,
    );
  }

  // Convert kilometers to meters to feed into the PostGIS calculation
  const maxDistanceMeters = maxDistanceKm * DISPATCH_CONSTANTS.METERS_PER_KILOMETER;

  try {
    // Querying the raw database directly to use geographic logic
    const nearestDrivers = await prisma.$queryRaw`
      SELECT
        id,
        "userId",
        "vehicleType",
        capacity,
        "currentLat" AS latitude,
        "currentLng" AS longitude,
        "currentRegion",
        ST_Distance(
          location,
          ST_SetSRID(
            ST_MakePoint(${farmerProfile.longitude}, ${farmerProfile.latitude}),
            ${DISPATCH_CONSTANTS.POSTGIS_SRID}::integer
          )::geometry
        ) / 1000 AS distance_km
      FROM "TransportProfile"
      WHERE
        "isAvailable" = TRUE
        AND location IS NOT NULL
        AND capacity >= ${order.quantity}
        AND ST_DWithin(
          location,
          ST_SetSRID(
            ST_MakePoint(${farmerProfile.longitude}, ${farmerProfile.latitude}),
            ${DISPATCH_CONSTANTS.POSTGIS_SRID}::integer
          )::geometry,
          ${maxDistanceMeters}
        )
      ORDER BY distance_km ASC
      LIMIT 1;
    `;

    return (nearestDrivers && nearestDrivers.length) ? nearestDrivers[0] : null;
  } catch (error) {
    Logger.error("PostGIS dispatch query failed", { error: error.message });
    throw new AppError("Failed to locate an available transporter.", 500);
  }
};

/**
 * Update transporter availability and spatial location.
 */
const updateTransportProfile = async (userId, locationData) => {
  const { available, latitude, longitude, currentAddress, currentRegion } =
    locationData;

  const profile = await prisma.transportProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("Transport profile not found.", 404);
  }

  if (latitude == null || longitude == null) {
    throw new AppError(
      "Latitude and longitude are required for location updates.",
      400,
    );
  }

  try {
    // Save the coordinate components alongside the spatial geometry field
    const result = await prisma.$executeRaw`
    UPDATE "TransportProfile"
    SET
      "isAvailable" = ${available},
      "currentLat" = ${latitude},
      "currentLng" = ${longitude},
      "currentAddress" = ${currentAddress},
      "currentRegion" = ${currentRegion},
      "location" = ST_SetSRID(
        ST_MakePoint(${longitude}, ${latitude}),
        ${DISPATCH_CONSTANTS.POSTGIS_SRID}::integer
      )::geometry
    WHERE "userId" = ${userId}
  `;

    return result;
  } catch (err) {
    Logger.error("Transport profile update failed", { error: err.message, userId });
    throw new AppError("Failed to update transport profile.", 500);
  }
};

module.exports = {
  findNearestAvailableDriver,
  updateTransportProfile,
};

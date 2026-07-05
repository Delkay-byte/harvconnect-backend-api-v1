/**
 * Dispatch and PostGIS configuration constants
 */

module.exports = {
  // Default search radius for transporter assignment (kilometers)
  DEFAULT_DISPATCH_RADIUS_KM: 50,

  // Conversion factor from kilometers to meters
  METERS_PER_KILOMETER: 1000,

  // PostGIS Spatial Reference System Identifier (WGS84)
  POSTGIS_SRID: 4326,

  // Order number generation range
  ORDER_NUMBER_MIN: 1000,
  ORDER_NUMBER_MAX: 9999,
};
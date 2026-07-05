-- AlterTable
ALTER TABLE "TransportProfile" ADD COLUMN     "location" geometry;

-- CreateIndex
CREATE INDEX "TransportProfile_isAvailable_idx" ON "TransportProfile"("isAvailable");

-- CreateIndex
CREATE INDEX "TransportProfile_currentLat_currentLng_idx" ON "TransportProfile"("currentLat", "currentLng");

-- CreateIndex
CREATE INDEX "TransportProfile_location_idx" ON "TransportProfile" USING GIST ("location");

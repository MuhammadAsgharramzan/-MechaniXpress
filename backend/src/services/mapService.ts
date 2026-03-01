/**
 * Mock Map Service for Distance/Duration and Geocoding.
 */
export const mapService = {

    // Calculate straight-line distance (Haversine-ish) for mock
    async getDistanceAndDuration(origin: { lat: number, lng: number }, dest: { lat: number, lng: number }) {
        console.log(`[MockMap] Calculating user distance from Mechanic...`);

        // Rough calc: 1 deg lat ~ 111km. 
        const dx = Math.abs(origin.lat - dest.lat) * 111;
        const dy = Math.abs(origin.lng - dest.lng) * 111;
        const distanceKm = Math.sqrt(dx * dx + dy * dy);

        // Assume mock speed of 40km/h
        const durationMins = (distanceKm / 40) * 60;

        return {
            distanceText: `${distanceKm.toFixed(1)} km`,
            distanceValue: distanceKm * 1000, // meters
            durationText: `${Math.ceil(durationMins)} mins`,
            durationValue: durationMins * 60, // seconds
        };
    },

    async getAddressFromCoords(lat: number, lng: number) {
        return `Mock Address at [${lat.toFixed(4)}, ${lng.toFixed(4)}]`;
    }
};

import axios from 'axios';

const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const MAPS_BASE_URL = process.env.GOOGLE_MAPS_BASE_URL || 'https://maps.googleapis.com/maps/api';

const log = (msg) => console.log(`[${new Date().toISOString()}] [GoogleMaps] ${msg}`);

export async function geocodeAddress(address) {
  if (!MAPS_API_KEY) throw new Error('GOOGLE_MAPS_API_KEY is not configured');
  if (!address) throw new Error('Address is required');

  log(`geocodeAddress: "${address}"`);

  const { data } = await axios.get(`${MAPS_BASE_URL}/geocode/json`, {
    params: { address, key: MAPS_API_KEY },
    timeout: 15000,
  });

  if (data.status !== 'OK' || !data.results?.length) {
    log(`geocodeAddress: no results — status=${data.status}`);
    return null;
  }

  const result = data.results[0];
  const { lat, lng } = result.geometry.location;

  const components = {};
  for (const comp of result.address_components) {
    for (const type of comp.types) {
      components[type] = comp.long_name;
      components[`${type}_short`] = comp.short_name;
    }
  }

  log(`geocodeAddress: ${lat}, ${lng}`);

  return {
    lat,
    lng,
    formatted_address: result.formatted_address,
    city: components.locality || components.sublocality || null,
    state: components.administrative_area_level_1 || null,
    state_short: components.administrative_area_level_1_short || null,
    zip: components.postal_code || null,
    county: components.administrative_area_level_2 || null,
    place_id: result.place_id,
  };
}

export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth radius in miles
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 100) / 100; // miles, 2 decimal places
}

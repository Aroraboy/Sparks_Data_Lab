import supabase from '../lib/supabase.js';
import axios from 'axios';

const log = (msg) => console.log(`[${new Date().toISOString()}] [Geocode] ${msg}`);

export default async function processGeocode(job) {
  const { permit_ids } = job.data || {};

  const MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  if (!MAPS_API_KEY) {
    log('GOOGLE_MAPS_API_KEY not configured — skipping');
    return { skipped: true };
  }

  const mapsBaseUrl = process.env.GOOGLE_MAPS_BASE_URL || 'https://maps.googleapis.com/maps/api';

  // Get permit leads that need geocoding
  let query = supabase
    .from('permit_leads')
    .select('id, address, city, state')
    .is('latitude', null)
    .not('address', 'is', null);

  if (permit_ids && permit_ids.length > 0) {
    query = query.in('id', permit_ids);
  } else {
    query = query.limit(50);
  }

  const { data: permits, error } = await query;
  if (error) {
    log(`Query error: ${error.message}`);
    throw error;
  }

  if (!permits || permits.length === 0) {
    log('No permits to geocode');
    return { geocoded: 0 };
  }

  log(`Geocoding ${permits.length} permit addresses`);
  let geocoded = 0;

  for (const permit of permits) {
    try {
      const fullAddress = [permit.address, permit.city, permit.state]
        .filter(Boolean)
        .join(', ');

      const { data: result } = await axios.get(`${mapsBaseUrl}/geocode/json`, {
        params: { address: fullAddress, key: MAPS_API_KEY },
        timeout: 15000,
      });

      if (result.status === 'OK' && result.results?.length > 0) {
        const geo = result.results[0];
        const { lat, lng } = geo.geometry.location;

        const components = {};
        for (const comp of geo.address_components) {
          for (const type of comp.types) {
            components[type] = comp.long_name;
            components[`${type}_short`] = comp.short_name;
          }
        }

        await supabase
          .from('permit_leads')
          .update({
            latitude: lat,
            longitude: lng,
            formatted_address: geo.formatted_address,
            zip_code: components.postal_code || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', permit.id);

        geocoded++;
        log(`${permit.address} → ${lat}, ${lng}`);
      } else {
        log(`No geocode result for: ${fullAddress}`);
      }

      // Small delay to respect rate limits
      await new Promise((r) => setTimeout(r, 100));
    } catch (err) {
      log(`Geocode error for ${permit.id}: ${err.message}`);
    }
  }

  log(`Geocoding complete: ${geocoded}/${permits.length}`);
  return { geocoded, total: permits.length };
}

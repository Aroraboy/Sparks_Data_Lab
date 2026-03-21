import supabase from '../lib/supabase.js';
import FriscoScraper from '../../scrapers/frisco.scraper.js';
import PlanoScraper from '../../scrapers/plano.scraper.js';

const log = (msg) => console.log(`[${new Date().toISOString()}] [PermitScrape] ${msg}`);

const SCRAPERS = [FriscoScraper, PlanoScraper];

const COMMERCIAL_INCLUDE = [
  'commercial', 'office', 'retail', 'restaurant', 'warehouse',
  'industrial', 'mixed use', 'mixed-use', 'hotel', 'multifamily',
  'multi-family', 'apartment', 'medical', 'clinic', 'hospital',
  'school', 'church', 'tenant', 'build-out', 'buildout', 'shell',
  'shopping', 'plaza', 'strip mall', 'data center',
];

const COMMERCIAL_EXCLUDE = [
  'single family', 'single-family', 'residential addition',
  'deck', 'fence', 'pool', 'sprinkler', 'irrigation',
  'solar panel', 'water heater', 're-roof', 'reroof',
];

function isCommercial(permit) {
  const text = [
    permit.project_name,
    permit.project_type,
    permit.description,
  ].filter(Boolean).join(' ').toLowerCase();

  const hasExclude = COMMERCIAL_EXCLUDE.some((kw) => text.includes(kw));
  if (hasExclude) return false;

  const hasInclude = COMMERCIAL_INCLUDE.some((kw) => text.includes(kw));
  if (hasInclude) return true;

  // If estimated value > $500k, likely commercial
  if (permit.estimated_value && permit.estimated_value >= 500000) return true;

  return false;
}

export default async function processPermitScrape(job) {
  const { cities } = job.data || {};
  log(`Starting permit scrape job — cities: ${cities || 'all'}`);

  const results = [];

  for (const ScraperClass of SCRAPERS) {
    const scraper = new ScraperClass();

    if (cities && !cities.includes(scraper.cityName.toLowerCase())) {
      continue;
    }

    const startTime = Date.now();
    let scrapeLog = {
      city: scraper.cityName,
      portal_url: scraper.portalUrl,
      records_found: 0,
      records_inserted: 0,
      records_skipped: 0,
      status: 'success',
    };

    try {
      await scraper.launch();
      const permits = await scraper.scrape();
      scrapeLog.records_found = permits.length;

      const commercial = permits.filter(isCommercial);
      log(`${scraper.cityName}: ${permits.length} total, ${commercial.length} commercial`);

      for (const permit of commercial) {
        try {
          const { error } = await supabase
            .from('permit_leads')
            .upsert(
              {
                permit_number: permit.permit_number,
                city: scraper.cityName,
                state: permit.state || 'TX',
                project_name: permit.project_name || null,
                address: permit.address || null,
                project_type: permit.project_type || 'Unknown',
                estimated_value: permit.estimated_value || null,
                application_date: permit.application_date || null,
                owner_name: permit.owner_name || null,
                gc_name: permit.gc_name || null,
                architect_name: permit.architect_name || null,
                source_url: permit.source_url || scraper.portalUrl,
                portal_name: scraper.cityName,
              },
              { onConflict: 'permit_number,city' }
            );

          if (error) {
            log(`Upsert error for ${permit.permit_number}: ${error.message}`);
            scrapeLog.records_skipped++;
          } else {
            scrapeLog.records_inserted++;
          }
        } catch (err) {
          log(`Insert error: ${err.message}`);
          scrapeLog.records_skipped++;
        }
      }

      scrapeLog.records_skipped += permits.length - commercial.length;
    } catch (err) {
      log(`Scraper error for ${scraper.cityName}: ${err.message}`);
      scrapeLog.status = 'failed';
      scrapeLog.error_message = err.message;
    } finally {
      await scraper.close().catch(() => {});
      scrapeLog.duration_ms = Date.now() - startTime;

      // Log the scrape run
      await supabase.from('scrape_logs').insert(scrapeLog).catch((e) => {
        log(`Failed to log scrape: ${e.message}`);
      });

      results.push(scrapeLog);
    }
  }

  log(`Permit scrape complete: ${results.length} cities processed`);
  return results;
}

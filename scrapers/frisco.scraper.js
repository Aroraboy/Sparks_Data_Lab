import BaseScraper from './base.scraper.js';

export default class FriscoScraper extends BaseScraper {
  constructor() {
    super('Frisco', 'https://www.friscotexas.gov/614/Reports');
  }

  async scrape() {
    const log = (msg) => console.log(`[${new Date().toISOString()}] [Frisco] ${msg}`);

    try {
      await this.launch();
      log(`Navigating to ${this.portalUrl}`);
      await this.navigate(this.portalUrl);
      await this.randomDelay();

      const permits = [];

      // Look for permit report tables or links to CSV/PDF reports
      // Frisco publishes commercial building permits in report format
      const links = await this.page.$$eval('a[href]', (anchors) =>
        anchors
          .filter((a) => {
            const text = (a.textContent || '').toLowerCase();
            const href = (a.href || '').toLowerCase();
            return (
              text.includes('permit') ||
              text.includes('commercial') ||
              href.includes('permit') ||
              href.includes('report')
            );
          })
          .map((a) => ({
            text: a.textContent?.trim() || '',
            href: a.href,
          }))
      );

      log(`Found ${links.length} permit-related links`);

      // Try to find a tabular listing page
      for (const link of links.slice(0, 5)) {
        try {
          log(`Following link: ${link.text}`);
          await this.page.goto(link.href, { waitUntil: 'load', timeout: 30000 });
          await this.randomDelay();

          // Look for tables with permit data
          const rows = await this.page.$$eval('table tr', (trs) =>
            trs.slice(1).map((tr) => {
              const cells = Array.from(tr.querySelectorAll('td')).map(
                (td) => td.textContent?.trim() || ''
              );
              return cells;
            })
          );

          if (rows.length > 0) {
            log(`Found table with ${rows.length} rows on ${link.text}`);
            for (const cells of rows) {
              if (cells.length >= 3) {
                permits.push({
                  permit_number: cells[0] || `FRISCO-${Date.now()}-${permits.length}`,
                  project_name: cells[1] || null,
                  address: cells[2] || null,
                  project_type: detectProjectType(cells.join(' ')),
                  estimated_value: extractValue(cells.join(' ')),
                  owner_name: cells[3] || null,
                  gc_name: cells[4] || null,
                  source_url: link.href,
                  application_date: extractDate(cells.join(' ')),
                });
              }
            }
          }
        } catch (err) {
          log(`Error following link ${link.text}: ${err.message}`);
        }
      }

      log(`Scraped ${permits.length} total permits from Frisco`);
      return permits;
    } catch (err) {
      log(`Frisco scraper error: ${err.message}`);
      return [];
    }
  }
}

function detectProjectType(text) {
  const lower = text.toLowerCase();
  if (lower.includes('ground') || lower.includes('new construction')) return 'Ground-Up';
  if (lower.includes('build-out') || lower.includes('buildout') || lower.includes('interior') || lower.includes('tenant')) return 'Interior Build-Out';
  if (lower.includes('mixed')) return 'Mixed';
  return 'Unknown';
}

function extractValue(text) {
  const match = text.match(/\$[\d,]+/);
  if (match) return parseInt(match[0].replace(/[$,]/g, ''), 10) || null;
  return null;
}

function extractDate(text) {
  const match = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
  if (match) {
    try {
      const d = new Date(match[1]);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    } catch { /* ignore */ }
  }
  return null;
}

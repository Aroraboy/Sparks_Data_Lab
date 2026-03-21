import BaseScraper from './base.scraper.js';

export default class PlanoScraper extends BaseScraper {
  constructor() {
    super('Plano', 'https://www.plano.gov/197/Building-Inspection');
  }

  async scrape() {
    const log = (msg) => console.log(`[${new Date().toISOString()}] [Plano] ${msg}`);

    try {
      await this.launch();
      log(`Navigating to ${this.portalUrl}`);
      await this.navigate(this.portalUrl);
      await this.randomDelay();

      const permits = [];

      // Look for permit-related links on the Plano building inspection page
      const links = await this.page.$$eval('a[href]', (anchors) =>
        anchors
          .filter((a) => {
            const text = (a.textContent || '').toLowerCase();
            const href = (a.href || '').toLowerCase();
            return (
              text.includes('permit') ||
              text.includes('commercial') ||
              text.includes('building') ||
              href.includes('permit') ||
              href.includes('accela')
            );
          })
          .map((a) => ({
            text: a.textContent?.trim() || '',
            href: a.href,
          }))
      );

      log(`Found ${links.length} permit-related links`);

      // Follow links looking for tabular data
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
                  permit_number: cells[0] || `PLANO-${Date.now()}-${permits.length}`,
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

          // Also check for list/card-style layouts
          const cards = await this.page.$$eval('.result-item, .permit-row, [class*="permit"]', (els) =>
            els.map((el) => ({
              text: el.textContent?.trim() || '',
              href: el.querySelector('a')?.href || '',
            }))
          );

          if (cards.length > 0) {
            log(`Found ${cards.length} card-style results`);
            for (const card of cards) {
              const numberMatch = card.text.match(/(PLN|BLD|COM)[-\s]?\d+/i);
              permits.push({
                permit_number: numberMatch?.[0] || `PLANO-${Date.now()}-${permits.length}`,
                project_name: card.text.slice(0, 100),
                address: extractAddress(card.text),
                project_type: detectProjectType(card.text),
                estimated_value: extractValue(card.text),
                source_url: card.href || link.href,
              });
            }
          }
        } catch (err) {
          log(`Error following link ${link.text}: ${err.message}`);
        }
      }

      log(`Scraped ${permits.length} total permits from Plano`);
      return permits;
    } catch (err) {
      log(`Plano scraper error: ${err.message}`);
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

function extractAddress(text) {
  // Look for patterns like "1234 Street Name" in text
  const match = text.match(/\d{2,5}\s+[A-Z][a-zA-Z\s]+(?:St|Ave|Blvd|Dr|Rd|Ln|Way|Pkwy|Ct|Pl|Cir)/);
  return match ? match[0] : null;
}

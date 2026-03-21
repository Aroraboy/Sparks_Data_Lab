import BaseScraper from './base.scraper.js';

export default class FriscoScraper extends BaseScraper {
  constructor() {
    super('Frisco', 'https://www.friscotexas.gov/614/Reports');
  }

  async scrape() {
    // TODO Phase 7: Implement Frisco permit portal scraper
    return [];
  }
}

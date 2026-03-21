import BaseScraper from './base.scraper.js';

export default class PlanoScraper extends BaseScraper {
  constructor() {
    super('Plano', 'https://www.plano.gov/197/Building-Inspection');
  }

  async scrape() {
    // TODO Phase 7: Implement Plano permit portal scraper
    return [];
  }
}

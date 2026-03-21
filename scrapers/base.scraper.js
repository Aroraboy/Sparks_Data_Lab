import { chromium } from 'playwright';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

export default class BaseScraper {
  constructor(cityName, portalUrl) {
    this.cityName = cityName;
    this.portalUrl = portalUrl;
    this.browser = null;
    this.page = null;
  }

  async launch() {
    log(`Launching browser for ${this.cityName}`);
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    this.page = await context.newPage();
  }

  async navigate(url) {
    await this.page.goto(url, { waitUntil: 'load', timeout: 30000 });
  }

  async randomDelay() {
    const ms = 2000 + Math.random() * 3000;
    await new Promise((r) => setTimeout(r, ms));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      log(`Browser closed for ${this.cityName}`);
    }
  }

  async scrape() {
    throw new Error(`scrape() must be implemented by ${this.cityName} scraper`);
  }
}

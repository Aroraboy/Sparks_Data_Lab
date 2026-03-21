import 'dotenv/config';
import cron from 'node-cron';
import {
  permitScrapeQueue,
  weeklyScrumQueue,
  overdueCheckerQueue,
  pdlEnrichQueue,
  emailVerifyQueue,
  geocodeQueue,
} from './queues/index.js';
import processPermitScrape from './jobs/permitScrape.job.js';
import processWeeklyScrum from './jobs/weeklyScrum.job.js';
import processOverdueChecker from './jobs/overdueChecker.job.js';
import processPdlEnrich from './jobs/pdlEnrich.job.js';
import processEmailVerify from './jobs/emailVerify.job.js';
import processGeocode from './jobs/geocode.job.js';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

// ─── Register queue processors ───────────────────────────
permitScrapeQueue.process(processPermitScrape);
weeklyScrumQueue.process(processWeeklyScrum);
overdueCheckerQueue.process(processOverdueChecker);
pdlEnrichQueue.process(processPdlEnrich);
emailVerifyQueue.process(processEmailVerify);
geocodeQueue.process(processGeocode);

// Global error handlers
const queues = [permitScrapeQueue, weeklyScrumQueue, overdueCheckerQueue, pdlEnrichQueue, emailVerifyQueue, geocodeQueue];
for (const q of queues) {
  q.on('failed', (job, err) => {
    log(`[${q.name}] Job ${job.id} failed: ${err.message}`);
  });
  q.on('completed', (job, result) => {
    log(`[${q.name}] Job ${job.id} completed: ${JSON.stringify(result)}`);
  });
}

// ─── Cron schedules ──────────────────────────────────────

// Permit Scraper — Daily 6:00 AM CST (UTC-6 → 12:00 UTC)
cron.schedule('0 12 * * *', () => {
  log('CRON: Adding permit scrape job');
  permitScrapeQueue.add({}, { jobId: `permit-scrape-${Date.now()}` });
});

// Weekly Scrum — Monday 8:00 AM CST (UTC-6 → 14:00 UTC)
cron.schedule('0 14 * * 1', () => {
  log('CRON: Adding weekly scrum job');
  weeklyScrumQueue.add({}, { jobId: `weekly-scrum-${Date.now()}` });
});

// Overdue Checker — Daily 9:00 AM CST (UTC-6 → 15:00 UTC)
cron.schedule('0 15 * * *', () => {
  log('CRON: Adding overdue checker job');
  overdueCheckerQueue.add({}, { jobId: `overdue-check-${Date.now()}` });
});

log('SPARKS DataLab workers starting...');
log('Queue processors registered: permit-scrape, weekly-scrum, overdue-checker, pdl-enrich, email-verify, geocode');
log('Cron schedules:');
log('  - Permit Scraper:  Daily 6:00 AM CST');
log('  - Weekly Scrum:    Monday 8:00 AM CST');
log('  - Overdue Checker: Daily 9:00 AM CST');
log('  - PDL Enrich:      On demand');
log('  - Email Verify:    On demand');
log('  - Geocode:         On demand');
log('Workers ready.');

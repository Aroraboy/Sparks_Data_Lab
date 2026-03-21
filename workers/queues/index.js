import Bull from 'bull';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const defaultOpts = {
  redis: REDIS_URL,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 200,
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
};

export const permitScrapeQueue = new Bull('permit-scrape', defaultOpts);
export const weeklyScrumQueue = new Bull('weekly-scrum', defaultOpts);
export const overdueCheckerQueue = new Bull('overdue-checker', defaultOpts);
export const pdlEnrichQueue = new Bull('pdl-enrich', defaultOpts);
export const emailVerifyQueue = new Bull('email-verify', defaultOpts);
export const geocodeQueue = new Bull('geocode', defaultOpts);

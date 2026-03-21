import axios from 'axios';

const NB_API_KEY = process.env.NEVERBOUNCE_API_KEY;
const NB_BASE_URL = process.env.NEVERBOUNCE_BASE_URL || 'https://api.neverbounce.com/v4';

const log = (msg) => console.log(`[${new Date().toISOString()}] [NeverBounce] ${msg}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getClient() {
  if (!NB_API_KEY) throw new Error('NEVERBOUNCE_API_KEY is not configured');
  return axios.create({
    baseURL: NB_BASE_URL,
    timeout: 30000,
  });
}

const RESULT_MAP = {
  0: 'valid',
  1: 'invalid',
  2: 'disposable',
  3: 'catchall',
  4: 'unknown',
};

export async function verifyEmail(email) {
  const client = getClient();
  log(`verifyEmail: ${email}`);

  const { data } = await client.get('/single/check', {
    params: { key: NB_API_KEY, email },
  });

  const status = RESULT_MAP[data.result] || 'unknown';
  log(`verifyEmail: ${email} → ${status}`);

  return {
    email,
    status,
    result_integer: data.result,
    flags: data.flags || [],
    suggested_correction: data.suggested_correction || null,
  };
}

export async function verifyBatch(emails) {
  if (!emails || emails.length === 0) return [];

  log(`verifyBatch: ${emails.length} emails`);
  const results = [];

  for (let i = 0; i < emails.length; i++) {
    if (i > 0) await sleep(200);
    try {
      const result = await verifyEmail(emails[i]);
      results.push(result);
    } catch (err) {
      log(`verifyBatch: failed for ${emails[i]} — ${err.message}`);
      results.push({
        email: emails[i],
        status: 'error',
        error: err.message,
      });
    }
  }

  log(`verifyBatch: completed ${results.length}/${emails.length}`);
  return results;
}

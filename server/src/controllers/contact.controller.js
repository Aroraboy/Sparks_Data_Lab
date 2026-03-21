import * as db from '../db/queries.js';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

export async function listContacts(req, res) {
  try {
    const {
      dataset_id, market, category, source,
      verified, search, page, limit,
    } = req.query;

    const filters = { page, limit };
    if (dataset_id) filters.dataset_id = dataset_id;
    if (market) filters.market = market;
    if (category) filters.category = category;
    if (source) filters.source = source;
    if (verified !== undefined) filters.verified = verified === 'true';
    if (search) filters.search = search;

    const result = await db.getContacts(filters);
    return res.json(result);
  } catch (err) {
    log(`listContacts error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
}

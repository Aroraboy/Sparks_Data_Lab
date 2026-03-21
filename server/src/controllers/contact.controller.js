import * as db from '../db/queries.js';
import * as pdl from '../services/pdl.service.js';
import * as neverbounce from '../services/neverbounce.service.js';

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

export async function searchPdlPersons(req, res) {
  try {
    const { query, size } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const result = await pdl.searchPersons({ query, size });
    return res.json(result);
  } catch (err) {
    log(`searchPdlPersons error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
}

export async function enrichPdlPerson(req, res) {
  try {
    const { email, linkedin_url, name, company } = req.body;
    if (!email && !linkedin_url && !name) {
      return res.status(400).json({ error: 'Provide email, linkedin_url, or name' });
    }

    const result = await pdl.enrichPerson({ email, linkedin_url, name, company });
    return res.json(result);
  } catch (err) {
    log(`enrichPdlPerson error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
}

export async function searchPdlCompanies(req, res) {
  try {
    const { query, size } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const result = await pdl.searchCompanies({ query, size });
    return res.json(result);
  } catch (err) {
    log(`searchPdlCompanies error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
}

export async function verifyContactEmail(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });

    const result = await neverbounce.verifyEmail(email);

    // Update the contact record if we find one with this email
    await db.updateContactVerification(email, result.status);

    return res.json(result);
  } catch (err) {
    log(`verifyContactEmail error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
}

export async function verifyBatchEmails(req, res) {
  try {
    const { emails } = req.body;
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'emails array is required' });
    }
    if (emails.length > 100) {
      return res.status(400).json({ error: 'Max 100 emails per batch' });
    }

    const results = await neverbounce.verifyBatch(emails);

    // Update contact records in bulk
    for (const r of results) {
      if (r.status && r.status !== 'error') {
        await db.updateContactVerification(r.email, r.status);
      }
    }

    return res.json({ results });
  } catch (err) {
    log(`verifyBatchEmails error: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
}

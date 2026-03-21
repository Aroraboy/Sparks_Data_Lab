import { z } from 'zod';
import * as db from '../db/queries.js';
import { fetchSheetData, extractSpreadsheetId } from '../services/googlesheets.service.js';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

const createDatasetSchema = z.object({
  name: z.string().min(2).max(200),
  request_id: z.string().uuid().optional().nullable(),
  purpose: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  market: z.string().optional().nullable(),
  request_type: z.string().optional().nullable(),
  sheet_url: z.string().url().optional().nullable(),
  record_count: z.number().int().min(0).optional().default(0),
  delivery_note: z.string().optional().nullable(),
  is_pre_existing: z.boolean().optional().default(false),
});

const updateDatasetSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  purpose: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  market: z.string().optional().nullable(),
  request_type: z.string().optional().nullable(),
  sheet_url: z.string().url().optional().nullable(),
  record_count: z.number().int().min(0).optional(),
  delivery_note: z.string().optional().nullable(),
});

const addSourceSchema = z.object({
  source_name: z.string().min(1).max(200),
  source_url: z.string().url().optional().nullable(),
  tool_used: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function listDatasets(req, res) {
  try {
    const { company, market, request_type, search, page, limit } = req.query;
    const filters = { page, limit };
    if (company) filters.company = company;
    if (market) filters.market = market;
    if (request_type) filters.request_type = request_type;
    if (search) filters.search = search;

    const result = await db.getDatasets(filters);
    return res.json(result);
  } catch (err) {
    log(`listDatasets error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch datasets' });
  }
}

export async function createDataset(req, res) {
  try {
    const parsed = createDatasetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    const dataset = await db.insertDataset({
      ...parsed.data,
      owner_id: req.user.id,
      owner_name: req.user.name || req.user.full_name || null,
    });

    return res.status(201).json({ data: dataset });
  } catch (err) {
    log(`createDataset error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to create dataset' });
  }
}

export async function getDataset(req, res) {
  try {
    const dataset = await db.getDatasetById(req.params.id);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    const sources = await db.getSourcesByDatasetId(req.params.id);

    return res.json({ data: { ...dataset, sources } });
  } catch (err) {
    log(`getDataset error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch dataset' });
  }
}

export async function patchDataset(req, res) {
  try {
    const existing = await db.getDatasetById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    const parsed = updateDatasetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    const updated = await db.updateDataset(req.params.id, parsed.data);
    return res.json({ data: updated });
  } catch (err) {
    log(`patchDataset error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to update dataset' });
  }
}

export async function addSource(req, res) {
  try {
    const existing = await db.getDatasetById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    const parsed = addSourceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    const source = await db.insertSource({
      dataset_id: req.params.id,
      ...parsed.data,
    });

    return res.status(201).json({ data: source });
  } catch (err) {
    log(`addSource error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to add source' });
  }
}

export async function importSheet(req, res) {
  try {
    const existing = await db.getDatasetById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    const { google_token, sheet_url, range } = req.body;
    if (!google_token) {
      return res.status(400).json({ error: 'google_token is required. Authorize via /auth/google/sheets-auth first.' });
    }

    const url = sheet_url || existing.sheet_url;
    if (!url) {
      return res.status(400).json({ error: 'No sheet_url provided or associated with this dataset' });
    }

    const spreadsheetId = extractSpreadsheetId(url);
    if (!spreadsheetId) {
      return res.status(400).json({ error: 'Invalid Google Sheets URL' });
    }

    const sheetData = await fetchSheetData(google_token, spreadsheetId, range || 'Sheet1');

    // Map rows to contacts and insert
    const FIELD_MAP = {
      full_name: ['full_name', 'name', 'contact_name', 'person'],
      company: ['company', 'company_name', 'organization', 'org'],
      designation: ['designation', 'title', 'job_title', 'position', 'role'],
      email: ['email', 'email_address', 'e-mail'],
      phone: ['phone', 'phone_number', 'mobile', 'telephone'],
      linkedin_url: ['linkedin_url', 'linkedin', 'linkedin_profile'],
      website: ['website', 'url', 'web'],
      city: ['city', 'location_city'],
      state: ['state', 'location_state', 'region'],
      market: ['market'],
      category: ['category', 'type', 'contact_type'],
    };

    function mapRow(row) {
      const contact = { dataset_id: req.params.id, source: 'google_sheet' };
      for (const [field, aliases] of Object.entries(FIELD_MAP)) {
        for (const alias of aliases) {
          if (row[alias] && row[alias].trim()) {
            contact[field] = row[alias].trim();
            break;
          }
        }
      }
      return contact;
    }

    const contacts = sheetData.rows.map(mapRow).filter((c) => c.full_name || c.email || c.company);

    let inserted = 0;
    for (const contact of contacts) {
      const { error } = await db.insertContact(contact);
      if (!error) inserted++;
    }

    // Update dataset record count
    await db.updateDataset(req.params.id, { record_count: (existing.record_count || 0) + inserted });

    log(`importSheet: imported ${inserted}/${contacts.length} contacts from ${spreadsheetId}`);
    return res.json({
      data: {
        total_rows: sheetData.total,
        mapped: contacts.length,
        inserted,
        headers: sheetData.headers,
      },
    });
  } catch (err) {
    log(`importSheet error: ${err.message}`);
    return res.status(500).json({ error: `Failed to import sheet: ${err.message}` });
  }
}

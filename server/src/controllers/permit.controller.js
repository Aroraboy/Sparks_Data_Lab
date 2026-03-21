import { z } from 'zod';
import * as db from '../db/queries.js';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

const PERMIT_STATUSES = ['New', 'Contacted', 'Assigned', 'Not Relevant'];

const updatePermitSchema = z.object({
  status: z.enum(PERMIT_STATUSES).optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function listPermits(req, res) {
  try {
    const {
      city, state, project_type, status,
      assigned_to, search, page, limit,
    } = req.query;

    const filters = { page, limit };
    if (city) filters.city = city;
    if (state) filters.state = state;
    if (project_type) filters.project_type = project_type;
    if (status) filters.status = status;
    if (assigned_to) filters.assigned_to = assigned_to;
    if (search) filters.search = search;

    const result = await db.getPermitLeads(filters);
    return res.json(result);
  } catch (err) {
    log(`listPermits error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch permits' });
  }
}

export async function patchPermit(req, res) {
  try {
    const existing = await db.getPermitLeadById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Permit lead not found' });
    }

    const parsed = updatePermitSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    const updated = await db.updatePermitLead(req.params.id, parsed.data);
    return res.json({ data: updated });
  } catch (err) {
    log(`patchPermit error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to update permit' });
  }
}

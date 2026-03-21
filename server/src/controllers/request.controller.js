import { z } from 'zod';
import * as db from '../db/queries.js';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

const REQUEST_TYPES = [
  'Contact Database',
  'Permit Intelligence',
  'Real Estate Comps',
  'Influencer & Media Research',
  'Subdivision & Land Intelligence',
  'Event & REF Data',
];

const COMPANIES = [
  'TX Sparks Construction',
  'SuperConstruct',
  'REF — Real Estate Forum',
  'Leezaspace',
  'General',
];

const MARKETS = [
  'DFW', 'Austin', 'Houston', 'San Antonio',
  'California', 'Phoenix', 'Multi-state',
  'National', 'Texas — All Markets',
];

const createRequestSchema = z.object({
  title: z.string().min(3).max(200),
  requirement: z.string().min(20),
  request_type: z.enum(REQUEST_TYPES),
  company: z.enum(COMPANIES),
  market: z.enum(MARKETS),
  priority: z.enum(['Normal', 'High', 'Urgent']).default('Normal'),
  assigned_to: z.array(z.string().uuid()).optional().default([]),
  timeline: z.string().date().optional().nullable(),
});

const updateRequestSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  requirement: z.string().min(20).optional(),
  request_type: z.enum(REQUEST_TYPES).optional(),
  company: z.enum(COMPANIES).optional(),
  market: z.enum(MARKETS).optional(),
  priority: z.enum(['Normal', 'High', 'Urgent']).optional(),
  status: z.enum(['In Progress', 'Completed', 'Flagged', 'On Hold']).optional(),
  assigned_to: z.array(z.string().uuid()).optional(),
  timeline: z.string().date().optional().nullable(),
  sheet_url: z.string().url().optional().nullable(),
  record_count: z.number().int().min(0).optional(),
  ai_plan: z.string().optional().nullable(),
});

const commentSchema = z.object({
  message: z.string().min(1),
});

// ─── DUPLICATE DETECTION ─────────────────────────────────

function detectDuplicates(title, datasets) {
  const titleLower = title.toLowerCase();
  const titleWords = titleLower.split(/\s+/).filter(w => w.length > 2);
  if (titleWords.length === 0) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const ds of datasets) {
    const dsNameLower = ds.name.toLowerCase();
    const matched = titleWords.filter(w => dsNameLower.includes(w));
    const score = matched.length / titleWords.length;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = ds;
    }
  }

  if (bestScore >= 0.5 && bestMatch) {
    return {
      message: 'Similar dataset already exists',
      similar: {
        id: bestMatch.id,
        name: bestMatch.name,
        sheet_url: bestMatch.sheet_url,
        created_at: bestMatch.created_at,
        owner_name: bestMatch.owner_name,
      },
    };
  }

  return null;
}

// ─── STRIP HTML ──────────────────────────────────────────

function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '');
}

// ─── CONTROLLERS ─────────────────────────────────────────

export async function createRequest(req, res) {
  try {
    const parsed = createRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.issues,
      });
    }

    const data = parsed.data;

    // Sanitize text inputs
    data.title = stripHtml(data.title);
    data.requirement = stripHtml(data.requirement);

    // Duplicate detection
    let warning = null;
    try {
      const datasets = await db.getAllDatasetNames();
      warning = detectDuplicates(data.title, datasets);
    } catch (err) {
      log(`Duplicate detection failed: ${err.message}`);
    }

    // Insert request
    const request = await db.insertRequest({
      ...data,
      requested_by: req.user.id,
    });

    // Insert status history
    await db.insertStatusHistory({
      request_id: request.id,
      changed_by: req.user.id,
      old_status: null,
      new_status: 'In Progress',
    });

    // Insert notifications for assigned users
    if (data.assigned_to && data.assigned_to.length > 0) {
      const notifications = data.assigned_to.map(userId => ({
        user_id: userId,
        message: `You have been assigned to: ${data.title}`,
        type: 'assigned',
        link: `/requests/${request.id}`,
      }));
      await db.insertNotifications(notifications);

      // Try sending assignment email (stub is OK, won't throw in this phase)
      try {
        const { sendAssignmentEmail } = await import('../services/resend.service.js');
        const assignedUsers = await db.getUsersByIds(data.assigned_to);
        await sendAssignmentEmail(assignedUsers, request);
      } catch (emailErr) {
        log(`Assignment email skipped: ${emailErr.message}`);
      }
    }

    const response = { data: request };
    if (warning) response.warning = warning;

    return res.status(201).json(response);
  } catch (err) {
    log(`createRequest error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to create request' });
  }
}

export async function listRequests(req, res) {
  try {
    const {
      status, request_type, company, market,
      assigned_to, search, from_date, to_date,
      my_tasks, page, limit,
    } = req.query;

    const filters = { page, limit };
    if (status) filters.status = status;
    if (request_type) filters.request_type = request_type;
    if (company) filters.company = company;
    if (market) filters.market = market;
    if (search) filters.search = stripHtml(search);
    if (from_date) filters.from_date = from_date;
    if (to_date) filters.to_date = to_date;

    if (my_tasks === 'true') {
      filters.assigned_to = req.user.id;
    } else if (assigned_to) {
      filters.assigned_to = assigned_to;
    }

    const result = await db.getRequests(filters);
    return res.json(result);
  } catch (err) {
    log(`listRequests error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch requests' });
  }
}

export async function getRequest(req, res) {
  try {
    const request = await db.getRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Get assigned user details
    const assignedUsers = await db.getUsersByIds(request.assigned_to || []);

    // Get status history
    const statusHistory = await db.getStatusHistory(request.id);

    return res.json({
      data: {
        ...request,
        assigned_users: assignedUsers,
        status_history: statusHistory,
      },
    });
  } catch (err) {
    log(`getRequest error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch request' });
  }
}

export async function patchRequest(req, res) {
  try {
    // Get existing request
    const existing = await db.getRequestById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Only requester, assigned member, or admin can update
    const isRequester = req.user.id === existing.requested_by;
    const isAssigned = (existing.assigned_to || []).includes(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isRequester && !isAssigned && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const parsed = updateRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.issues,
      });
    }

    const updates = parsed.data;

    // Sanitize text inputs
    if (updates.title) updates.title = stripHtml(updates.title);
    if (updates.requirement) updates.requirement = stripHtml(updates.requirement);

    // On status change, record history + notify
    if (updates.status && updates.status !== existing.status) {
      await db.insertStatusHistory({
        request_id: existing.id,
        changed_by: req.user.id,
        old_status: existing.status,
        new_status: updates.status,
      });

      // Notify all assigned members about status change
      const toNotify = (existing.assigned_to || []).filter(id => id !== req.user.id);
      if (toNotify.length > 0) {
        const notifications = toNotify.map(userId => ({
          user_id: userId,
          message: `Request "${existing.title}" status changed to ${updates.status}`,
          type: 'status_changed',
          link: `/requests/${existing.id}`,
        }));
        await db.insertNotifications(notifications);
      }
    }

    const updated = await db.updateRequest(req.params.id, updates);
    return res.json({ data: updated });
  } catch (err) {
    log(`patchRequest error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to update request' });
  }
}

export async function removeRequest(req, res) {
  try {
    await db.deleteRequest(req.params.id);
    return res.json({ data: { message: 'Request deleted' } });
  } catch (err) {
    log(`removeRequest error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to delete request' });
  }
}

export async function addComment(req, res) {
  try {
    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.issues,
      });
    }

    const comment = await db.insertComment({
      request_id: req.params.id,
      user_id: req.user.id,
      message: stripHtml(parsed.data.message),
    });

    // Notify assigned users + requester about the comment
    try {
      const request = await db.getRequestById(req.params.id);
      const toNotify = new Set([
        ...(request.assigned_to || []),
        request.requested_by,
      ]);
      toNotify.delete(req.user.id); // Don't notify the commenter

      if (toNotify.size > 0) {
        const notifications = [...toNotify].filter(Boolean).map(userId => ({
          user_id: userId,
          message: `New comment on "${request.title}" by ${req.user.name}`,
          type: 'comment',
          link: `/requests/${request.id}`,
        }));
        await db.insertNotifications(notifications);
      }
    } catch (notifErr) {
      log(`Comment notification failed: ${notifErr.message}`);
    }

    return res.status(201).json({ data: comment });
  } catch (err) {
    log(`addComment error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to add comment' });
  }
}

export async function listComments(req, res) {
  try {
    const comments = await db.getComments(req.params.id);
    return res.json({ data: comments });
  } catch (err) {
    log(`listComments error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
}

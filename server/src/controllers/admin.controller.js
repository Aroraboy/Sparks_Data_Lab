import { z } from 'zod';
import * as db from '../db/queries.js';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member']),
});

export async function listAdminUsers(req, res) {
  try {
    const users = await db.getAllUsersAdmin();
    return res.json({ data: users });
  } catch (err) {
    log(`listAdminUsers error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function updateUserRole(req, res) {
  try {
    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    // Prevent self-demotion
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const user = await db.updateUserRole(req.params.id, parsed.data.role);
    return res.json({ data: user });
  } catch (err) {
    log(`updateUserRole error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
}

export async function getAnalytics(req, res) {
  try {
    const [
      requestStats,
      datasetStats,
      userStats,
      recentRequests,
      topDatasets,
    ] = await Promise.all([
      db.getRequestStats(),
      db.getDatasetStats(),
      db.getUserStats(),
      db.getRecentRequestsSummary(),
      db.getTopDatasets(),
    ]);

    return res.json({
      data: {
        requests: requestStats,
        datasets: datasetStats,
        users: userStats,
        recent_requests: recentRequests,
        top_datasets: topDatasets,
      },
    });
  } catch (err) {
    log(`getAnalytics error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

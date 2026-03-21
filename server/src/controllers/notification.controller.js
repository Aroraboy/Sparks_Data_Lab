import * as db from '../db/queries.js';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

export async function listNotifications(req, res) {
  try {
    const notifications = await db.getNotifications(req.user.id);
    return res.json({ data: notifications });
  } catch (err) {
    log(`listNotifications error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function markRead(req, res) {
  try {
    await db.markNotificationRead(req.params.id, req.user.id);
    return res.json({ success: true });
  } catch (err) {
    log(`markRead error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to mark notification read' });
  }
}

export async function markAllRead(req, res) {
  try {
    await db.markAllNotificationsRead(req.user.id);
    return res.json({ success: true });
  } catch (err) {
    log(`markAllRead error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to mark all notifications read' });
  }
}

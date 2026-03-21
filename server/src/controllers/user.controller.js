import { z } from 'zod';
import * as db from '../db/queries.js';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

export async function listUsers(req, res) {
  try {
    const users = await db.getAllUsers();
    return res.json({ data: users });
  } catch (err) {
    log(`listUsers error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function getUser(req, res) {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ data: user });
  } catch (err) {
    log(`getUser error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}

const updateUserSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  avatar_url: z.string().url().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
});

export async function updateUser(req, res) {
  try {
    // Users can only update their own profile (unless admin)
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    const updated = await db.updateUserProfile(req.params.id, parsed.data);
    return res.json({ data: updated });
  } catch (err) {
    log(`updateUser error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

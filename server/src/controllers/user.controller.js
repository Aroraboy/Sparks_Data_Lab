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

export async function updateUser(req, res) {
  try {
    // Users can only update their own profile (unless admin)
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Stub — will be expanded
    return res.status(501).json({ error: 'Not implemented' });
  } catch (err) {
    log(`updateUser error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

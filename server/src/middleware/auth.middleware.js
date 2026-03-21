import supabase from '../db/supabase.js';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user exists in our users table
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      log(`requireAuth DB error: ${dbError.message}`);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // If user exists in DB, check active status
    if (dbUser) {
      if (!dbUser.is_active) {
        return res.status(401).json({ error: 'Account deactivated' });
      }
      req.user = dbUser;
    } else {
      // User authenticated via Supabase Auth but not yet in users table
      // (first login — sync-user endpoint will create the row)
      req.user = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
        role: 'member',
        is_active: true,
        user_metadata: user.user_metadata,
      };
    }

    next();
  } catch (err) {
    log(`requireAuth error: ${err.message}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

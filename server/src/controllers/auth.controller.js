import supabase from '../db/supabase.js';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

export async function syncUser(req, res) {
  try {
    const { id, email, user_metadata } = req.user;
    const name = user_metadata?.full_name || user_metadata?.name || email.split('@')[0];
    const avatar_url = user_metadata?.avatar_url || user_metadata?.picture || null;
    const google_id = user_metadata?.sub || user_metadata?.provider_id || null;

    // Check if user already exists in our users table
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      log(`syncUser fetch error: ${fetchError.message}`);
      return res.status(500).json({ error: 'Failed to sync user' });
    }

    if (existingUser) {
      // User exists — update updated_at
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        log(`syncUser update error: ${updateError.message}`);
        return res.status(500).json({ error: 'Failed to sync user' });
      }

      return res.json({ data: updated });
    }

    // New user — insert with role = 'member'
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id,
        email,
        name,
        avatar_url,
        google_id,
        role: 'member',
      })
      .select()
      .single();

    if (insertError) {
      log(`syncUser insert error: ${insertError.message}`);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    log(`New user created: ${email}`);
    return res.status(201).json({ data: newUser });
  } catch (err) {
    log(`syncUser error: ${err.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

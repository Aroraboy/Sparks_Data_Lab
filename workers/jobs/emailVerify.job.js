import supabase from '../lib/supabase.js';
import axios from 'axios';

const log = (msg) => console.log(`[${new Date().toISOString()}] [EmailVerify] ${msg}`);

const NB_RESULT_MAP = {
  0: 'valid',
  1: 'invalid',
  2: 'disposable',
  3: 'catchall',
  4: 'unknown',
};

export default async function processEmailVerify(job) {
  const { contact_ids, dataset_id } = job.data || {};

  const NB_API_KEY = process.env.NEVERBOUNCE_API_KEY;
  if (!NB_API_KEY) {
    log('NEVERBOUNCE_API_KEY not configured — skipping');
    return { skipped: true };
  }

  const nbBaseUrl = process.env.NEVERBOUNCE_BASE_URL || 'https://api.neverbounce.com/v4';

  // Get contacts to verify
  let query = supabase.from('contacts').select('id, email, verification_status');
  if (contact_ids && contact_ids.length > 0) {
    query = query.in('id', contact_ids);
  } else if (dataset_id) {
    query = query.eq('dataset_id', dataset_id).eq('verification_status', 'pending');
  } else {
    query = query.eq('verification_status', 'pending').not('email', 'is', null).limit(50);
  }

  const { data: contacts, error } = await query;
  if (error) {
    log(`Query error: ${error.message}`);
    throw error;
  }

  const withEmail = (contacts || []).filter((c) => c.email);
  if (withEmail.length === 0) {
    log('No contacts to verify');
    return { verified: 0 };
  }

  log(`Verifying ${withEmail.length} emails`);
  let verified = 0;

  for (const contact of withEmail) {
    try {
      const { data: result } = await axios.get(`${nbBaseUrl}/single/check`, {
        params: { key: NB_API_KEY, email: contact.email },
        timeout: 30000,
      });

      const status = NB_RESULT_MAP[result.result] || 'unknown';
      const isValid = status === 'valid';

      await supabase
        .from('contacts')
        .update({
          verification_status: status,
          verified: isValid,
          verified_at: isValid ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contact.id);

      verified++;
      log(`${contact.email} → ${status}`);

      // 200ms delay between calls
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      log(`Verify error for ${contact.email}: ${err.message}`);
    }
  }

  log(`Verification complete: ${verified}/${withEmail.length}`);
  return { verified, total: withEmail.length };
}

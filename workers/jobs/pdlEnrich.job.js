import supabase from '../lib/supabase.js';
import axios from 'axios';

const log = (msg) => console.log(`[${new Date().toISOString()}] [PDLEnrich] ${msg}`);

export default async function processPdlEnrich(job) {
  const { contact_ids, dataset_id } = job.data || {};

  const PDL_API_KEY = process.env.PDL_API_KEY;
  if (!PDL_API_KEY) {
    log('PDL_API_KEY not configured — skipping');
    return { skipped: true };
  }

  const pdlClient = axios.create({
    baseURL: process.env.PDL_BASE_URL || 'https://api.peopledatalabs.com/v5',
    headers: { 'X-Api-Key': PDL_API_KEY },
    timeout: 30000,
  });

  // Get contacts to enrich
  let query = supabase.from('contacts').select('*');
  if (contact_ids && contact_ids.length > 0) {
    query = query.in('id', contact_ids);
  } else if (dataset_id) {
    query = query.eq('dataset_id', dataset_id).is('pdl_id', null);
  } else {
    query = query.is('pdl_id', null).limit(50);
  }

  const { data: contacts, error } = await query;
  if (error) {
    log(`Query error: ${error.message}`);
    throw error;
  }

  if (!contacts || contacts.length === 0) {
    log('No contacts to enrich');
    return { enriched: 0 };
  }

  log(`Enriching ${contacts.length} contacts`);
  let enriched = 0;

  for (const contact of contacts) {
    try {
      const params = {};
      if (contact.email) params.email = contact.email;
      if (contact.linkedin_url) params.profile = contact.linkedin_url;
      if (contact.full_name) params.name = contact.full_name;
      if (contact.company) params.company = contact.company;

      if (Object.keys(params).length === 0) continue;

      const { data: result } = await pdlClient.get('/person/enrich', { params });
      const p = result.data || result;

      const updates = {};
      if (p.id) updates.pdl_id = p.id;
      if (p.full_name && !contact.full_name) updates.full_name = p.full_name;
      if (p.job_company_name && !contact.company) updates.company = p.job_company_name;
      if (p.job_title && !contact.designation) updates.designation = p.job_title;
      if ((p.work_email || p.personal_emails?.[0]) && !contact.email) {
        updates.email = p.work_email || p.personal_emails[0];
      }
      if ((p.mobile_phone || p.phone_numbers?.[0]) && !contact.phone) {
        updates.phone = p.mobile_phone || p.phone_numbers[0];
      }
      if (p.linkedin_url && !contact.linkedin_url) updates.linkedin_url = p.linkedin_url;
      if (p.location_locality && !contact.city) updates.city = p.location_locality;
      if (p.location_region && !contact.state) updates.state = p.location_region;

      updates.source = 'pdl';
      updates.updated_at = new Date().toISOString();

      await supabase.from('contacts').update(updates).eq('id', contact.id);
      enriched++;
      log(`Enriched: ${contact.full_name || contact.email}`);

      // Rate limit: ~200ms between calls
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      if (err.response?.status === 404) {
        log(`No PDL match for ${contact.full_name || contact.email}`);
      } else {
        log(`Enrich error for ${contact.id}: ${err.message}`);
      }
    }
  }

  log(`Enrichment complete: ${enriched}/${contacts.length}`);
  return { enriched, total: contacts.length };
}

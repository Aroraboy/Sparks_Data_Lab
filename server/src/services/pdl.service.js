import axios from 'axios';

const PDL_API_KEY = process.env.PDL_API_KEY;
const PDL_BASE_URL = process.env.PDL_BASE_URL || 'https://api.peopledatalabs.com/v5';

const log = (msg) => console.log(`[${new Date().toISOString()}] [PDL] ${msg}`);

function getClient() {
  if (!PDL_API_KEY) throw new Error('PDL_API_KEY is not configured');
  return axios.create({
    baseURL: PDL_BASE_URL,
    headers: { 'X-Api-Key': PDL_API_KEY },
    timeout: 30000,
  });
}

export async function searchPersons({ query, size = 10, dataset_id, scroll_token } = {}) {
  const client = getClient();
  log(`searchPersons: query="${query}", size=${size}`);

  const body = {
    size: Math.min(size, 100),
    dataset: 'all',
    query: {
      bool: {
        must: [{ match: { _all: query } }],
      },
    },
  };

  if (scroll_token) body.scroll_token = scroll_token;

  const { data } = await client.post('/person/search', body);

  log(`searchPersons: found ${data.total} results`);
  return {
    results: (data.data || []).map(mapPdlPerson),
    total: data.total || 0,
    scroll_token: data.scroll_token || null,
  };
}

export async function enrichPerson({ email, linkedin_url, name, company } = {}) {
  const client = getClient();
  const params = {};
  if (email) params.email = email;
  if (linkedin_url) params.profile = linkedin_url;
  if (name) params.name = name;
  if (company) params.company = company;

  log(`enrichPerson: ${JSON.stringify(params)}`);

  const { data } = await client.get('/person/enrich', { params });

  log(`enrichPerson: status=${data.status}, likelihood=${data.likelihood}`);
  return {
    person: mapPdlPerson(data.data || data),
    likelihood: data.likelihood || 0,
  };
}

export async function searchCompanies({ query, size = 10 } = {}) {
  const client = getClient();
  log(`searchCompanies: query="${query}", size=${size}`);

  const body = {
    size: Math.min(size, 100),
    query: {
      bool: {
        must: [{ match: { _all: query } }],
      },
    },
  };

  const { data } = await client.post('/company/search', body);

  log(`searchCompanies: found ${data.total} results`);
  return {
    results: (data.data || []).map(mapPdlCompany),
    total: data.total || 0,
  };
}

function mapPdlPerson(p) {
  if (!p) return null;
  return {
    pdl_id: p.id || null,
    full_name: p.full_name || null,
    company: p.job_company_name || null,
    designation: p.job_title || null,
    email: p.work_email || p.personal_emails?.[0] || null,
    phone: p.mobile_phone || p.phone_numbers?.[0] || null,
    linkedin_url: p.linkedin_url || null,
    website: p.job_company_website || null,
    city: p.location_locality || null,
    state: p.location_region || null,
    industry: p.industry || null,
  };
}

function mapPdlCompany(c) {
  if (!c) return null;
  return {
    name: c.display_name || c.name || null,
    website: c.website || null,
    industry: c.industry || null,
    size: c.size || null,
    city: c.location?.locality || null,
    state: c.location?.region || null,
    linkedin_url: c.linkedin_url || null,
    founded: c.founded || null,
  };
}

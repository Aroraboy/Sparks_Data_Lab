# SPARKS DataLab

SPARKS DataLab is a private internal web application for the SPARKS group of companies. It replaces the current manual workflow where team members send data requests via WhatsApp and chat messages, with a centralized data intelligence platform that accepts structured data requests, runs AI-powered research, scrapes public government permit portals, enriches and verifies contacts, and stores everything in a central searchable repository.

The platform serves TX Sparks Construction, SuperConstruct, REF — Real Estate Forum, Leezaspace, and General operations across Texas and expanding US markets.

## Tech Stack

| Layer              | Technology                     | Version          |
| ------------------ | ------------------------------ | ---------------- |
| Frontend           | React + Vite + Tailwind CSS    | 18.x / 5.x / 3.x |
| State              | TanStack React Query + Zustand | 5.x / 4.x        |
| Routing            | React Router DOM               | 6.x              |
| Charts             | Recharts                       | 2.x              |
| Backend            | Express                        | 4.x              |
| Database           | Supabase (PostgreSQL)          | 2.x SDK          |
| AI                 | Anthropic API (Haiku + Opus)   | Latest           |
| Queues             | Bull + Redis                   | 4.x / 5.x        |
| Scraping           | Playwright                     | 1.x              |
| Email              | Resend                         | Latest           |
| Contact Enrichment | People Data Labs               | REST API         |
| Email Verification | NeverBounce                    | REST API         |
| Address Validation | Google Maps Geocoding          | REST API         |

## Local Setup

```bash
git clone <repo-url>
cd sparks-datalab

# Install dependencies for all packages
cd client && npm install && cd ..
cd server && npm install && cd ..
cd workers && npm install && cd ..

# Copy environment template
cp .env.example .env
# Fill in all environment variables (see below)

# Run Supabase migrations in order (001-015)
# Apply via Supabase dashboard or CLI

# Start development
cd client && npm run dev    # Port 5173
cd server && npm run dev    # Port 3001
node workers/index.js       # Background jobs
```

## Environment Variables

| Variable               | Description                  | Where to get                                 |
| ---------------------- | ---------------------------- | -------------------------------------------- |
| `ANTHROPIC_API_KEY`    | Anthropic API key for Claude | https://console.anthropic.com                |
| `PDL_API_KEY`          | People Data Labs API key     | https://dashboard.peopledatalabs.com         |
| `PDL_BASE_URL`         | PDL API base URL             | `https://api.peopledatalabs.com/v5`          |
| `NEVERBOUNCE_API_KEY`  | NeverBounce API key          | https://app.neverbounce.com                  |
| `NEVERBOUNCE_BASE_URL` | NeverBounce API base URL     | `https://api.neverbounce.com/v4`             |
| `RESEND_API_KEY`       | Resend email API key         | https://resend.com/api-keys                  |
| `RESEND_FROM_EMAIL`    | Sender email address         | Your verified domain                         |
| `RESEND_FROM_NAME`     | Sender display name          | `SPARKS DataLab`                             |
| `GOOGLE_MAPS_API_KEY`  | Google Maps API key          | https://console.cloud.google.com             |
| `GOOGLE_MAPS_BASE_URL` | Google Maps API base URL     | `https://maps.googleapis.com/maps/api`       |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID       | Google Cloud Console                         |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret   | Google Cloud Console                         |
| `GOOGLE_REDIRECT_URI`  | OAuth callback URL           | `http://localhost:3001/auth/google/callback` |
| `SUPABASE_URL`         | Supabase project URL         | Supabase dashboard                           |
| `SUPABASE_SERVICE_KEY` | Supabase service role key    | Supabase dashboard > Settings > API          |
| `SUPABASE_ANON_KEY`    | Supabase anonymous key       | Supabase dashboard > Settings > API          |
| `REDIS_URL`            | Redis connection string      | `redis://localhost:6379` locally             |
| `PORT`                 | Server port                  | `3001`                                       |
| `CLIENT_URL`           | Frontend URL                 | `http://localhost:5173`                      |
| `NODE_ENV`             | Environment                  | `development`                                |

## API Endpoints

| Method | Path                             | Auth  | Description              |
| ------ | -------------------------------- | ----- | ------------------------ |
| GET    | `/api/health`                    | None  | Health check             |
| POST   | `/api/auth/sync-user`            | Auth  | Sync user after OAuth    |
| GET    | `/api/users`                     | Auth  | List all users           |
| GET    | `/api/users/:id`                 | Auth  | Get user by ID           |
| PATCH  | `/api/users/:id`                 | Auth  | Update user              |
| GET    | `/api/requests`                  | Auth  | List requests (filtered) |
| POST   | `/api/requests`                  | Auth  | Create request           |
| GET    | `/api/requests/:id`              | Auth  | Get request detail       |
| PATCH  | `/api/requests/:id`              | Auth  | Update request           |
| DELETE | `/api/requests/:id`              | Admin | Delete request           |
| POST   | `/api/requests/:id/comments`     | Auth  | Add comment              |
| GET    | `/api/requests/:id/comments`     | Auth  | List comments            |
| GET    | `/api/datasets`                  | Auth  | List datasets            |
| POST   | `/api/datasets`                  | Auth  | Create dataset           |
| GET    | `/api/datasets/:id`              | Auth  | Get dataset detail       |
| PATCH  | `/api/datasets/:id`              | Auth  | Update dataset           |
| POST   | `/api/datasets/:id/sources`      | Auth  | Add source               |
| POST   | `/api/datasets/:id/import-sheet` | Auth  | Import from Google Sheet |
| GET    | `/api/contacts`                  | Auth  | List contacts            |
| GET    | `/api/permits`                   | Auth  | List permit leads        |
| PATCH  | `/api/permits/:id`               | Auth  | Update permit lead       |
| POST   | `/api/research`                  | Auth  | Run AI research (SSE)    |
| GET    | `/api/research/history`          | Auth  | Research history         |
| GET    | `/api/notifications`             | Auth  | User notifications       |
| PATCH  | `/api/notifications/:id/read`    | Auth  | Mark notification read   |
| PATCH  | `/api/notifications/read-all`    | Auth  | Mark all read            |
| GET    | `/api/admin/users`               | Admin | Admin user list          |
| PATCH  | `/api/admin/users/:id/role`      | Admin | Change user role         |
| GET    | `/api/admin/analytics`           | Admin | Analytics data           |

## Background Jobs

| Job             | Schedule           | Purpose                       |
| --------------- | ------------------ | ----------------------------- |
| Permit Scraper  | Daily 6:00 AM CST  | Scrape city permit portals    |
| Weekly Scrum    | Monday 8:00 AM CST | Send weekly status email      |
| Overdue Checker | Daily 9:00 AM CST  | Flag overdue requests         |
| PDL Enrich      | On demand          | Enrich contacts via PDL       |
| Email Verify    | On demand          | Verify emails via NeverBounce |
| Geocode         | On demand          | Geocode permit addresses      |

## Adding a New City Scraper

1. Create `scrapers/<city>.scraper.js`
2. Import and extend `BaseScraper`
3. Set `cityName` and `portalUrl` in constructor
4. Implement `scrape()` method that returns array of permit objects
5. Filter for commercial permits using include/exclude keyword lists
6. Register the scraper in the permit scraper job processor
7. Add the city portal URL to the configuration

## Deployment

- **Frontend**: Vercel — `npm run build` outputs to `dist/`
- **Backend**: Railway — `node server/index.js`
- **Workers**: Railway (separate service) — `node workers/index.js`
- **Redis**: Railway Redis plugin
- **Database**: Supabase Pro with point-in-time recovery

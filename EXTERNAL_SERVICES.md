# SPARKS DataLab — External Services & Paid API Requirements

**Prepared for:** CTO Approval  
**Application:** SPARKS DataLab — Internal Data Intelligence Platform  
**Date:** March 2026

---

## Executive Summary

SPARKS DataLab requires **7 external services** (6 paid, 1 free infrastructure). This document outlines each service, its purpose in the platform, pricing model, estimated usage, and the credentials/keys required.

---

## 1. Supabase (Database + Authentication)

| Item                 | Detail                                                                                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | PostgreSQL database hosting, user authentication (Google OAuth), Row Level Security                                                      |
| **Used For**         | All data storage (requests, datasets, contacts, permits, notifications, users), Google sign-in for team members                          |
| **Website**          | https://supabase.com                                                                                                                     |
| **Pricing**          | **Free tier**: 500 MB database, 50K monthly active users. **Pro plan**: $25/month — 8 GB database, daily backups, point-in-time recovery |
| **Recommended Plan** | **Pro ($25/month)** — for production reliability and backup guarantees                                                                   |
| **Keys Required**    | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (server), `SUPABASE_ANON_KEY` (server + client)                                                   |
| **Setup Steps**      | 1. Create project at supabase.com → 2. Enable Google Auth provider → 3. Run 15 SQL migrations → 4. Copy keys from Settings > API         |

**Monthly Estimated Cost: $25**

---

## 2. Anthropic (AI Research Engine)

| Item                         | Detail                                                                                                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**                  | AI-powered research generation — the core intelligence feature of the platform                                                                             |
| **Used For**                 | Processing data research requests across 4 modes: General Research, Contact Prospecting, Permit Analysis, Market Intelligence                              |
| **Website**                  | https://console.anthropic.com                                                                                                                              |
| **Models Used**              | **Claude Haiku 3.5** (`claude-haiku-4-5-20251001`) for preprocessing queries; **Claude Opus 4** (`claude-opus-4-5`) for generating full research responses |
| **Pricing**                  | Haiku: $1.00 input / $5.00 output per 1M tokens. Opus: $15.00 input / $75.00 output per 1M tokens                                                          |
| **Usage Pattern**            | Each research request = 1 Haiku call (~200 tokens) + 1 Opus call (~4,096 tokens output)                                                                    |
| **Estimated Cost Per Query** | ~$0.30–$0.50 per research request (varies by response length)                                                                                              |
| **Key Required**             | `ANTHROPIC_API_KEY`                                                                                                                                        |

**Monthly Estimated Cost: $50–$200** (depends on research volume; ~100–400 queries/month)

---

## 3. People Data Labs (Contact Enrichment)

| Item              | Detail                                                                                                                  |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Purpose**       | Enrich and search for business contacts — find emails, phone numbers, company info, LinkedIn profiles                   |
| **Used For**      | Contact search by industry/location/role, individual contact enrichment, company search                                 |
| **Website**       | https://www.peopledatalabs.com                                                                                          |
| **API Endpoints** | `POST /v5/person/search`, `GET /v5/person/enrich`, `POST /v5/company/search`                                            |
| **Pricing**       | **Free tier**: 100 API calls/month. **Starter**: $0.04–$0.10 per enrichment (volume tiered). Enterprise plans available |
| **Usage Pattern** | On-demand search from Contacts page + background batch enrichment job (50 contacts/batch, 200ms delay between calls)    |
| **Keys Required** | `PDL_API_KEY`, `PDL_BASE_URL`                                                                                           |

**Monthly Estimated Cost: $50–$300** (depends on enrichment volume)

---

## 4. NeverBounce (Email Verification)

| Item              | Detail                                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**       | Verify email addresses are valid/deliverable before outreach                                                                  |
| **Used For**      | Single email verification from Contacts page, batch verification of selected contacts, background verification job            |
| **Website**       | https://www.neverbounce.com                                                                                                   |
| **API Endpoint**  | `GET /v4/single/check`                                                                                                        |
| **Pricing**       | Pay-as-you-go: **$0.008 per verification** (volume discounts available). Monthly plans from $10/month for 1,000 verifications |
| **Usage Pattern** | Sequential verification with 200ms delay between calls. Batch size: 50 contacts per job run                                   |
| **Result Types**  | Valid, Invalid, Disposable, Catchall, Unknown                                                                                 |
| **Keys Required** | `NEVERBOUNCE_API_KEY`, `NEVERBOUNCE_BASE_URL`                                                                                 |

**Monthly Estimated Cost: $10–$50** (depends on contact volume)

---

## 5. Google Cloud Platform (Maps + Sheets OAuth)

### 5a. Google Maps Geocoding API

| Item              | Detail                                                                              |
| ----------------- | ----------------------------------------------------------------------------------- |
| **Purpose**       | Convert permit addresses into GPS coordinates for mapping and distance calculations |
| **Used For**      | Geocoding permit lead addresses, extracting city/state/zip/county from addresses    |
| **API Endpoint**  | `GET /maps/api/geocode/json`                                                        |
| **Pricing**       | **$5.00 per 1,000 geocode requests** (first $200/month free = 40,000 free requests) |
| **Usage Pattern** | Background job geocodes 50 permits per batch with 100ms delay between calls         |
| **Key Required**  | `GOOGLE_MAPS_API_KEY`                                                               |

### 5b. Google Sheets API (Read-Only)

| Item              | Detail                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| **Purpose**       | Import contact data from Google Sheets into datasets                                                      |
| **Used For**      | One-time imports via OAuth consent — reads rows from a specified sheet and maps columns to contact schema |
| **OAuth Scope**   | `spreadsheets.readonly` (read-only, no write access)                                                      |
| **Pricing**       | **Free** (included in Google Cloud free tier)                                                             |
| **Keys Required** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`                                         |

### Google Cloud Setup

1. Create project at https://console.cloud.google.com
2. Enable **Geocoding API** and **Google Sheets API**
3. Create API key (restrict to Geocoding API) → `GOOGLE_MAPS_API_KEY`
4. Create OAuth 2.0 Client ID (Web application) → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
5. Set authorized redirect URI: `http://localhost:3001/auth/google/callback` (dev) or production URL

**Monthly Estimated Cost: $0–$25** (likely free under $200/month credit)

---

## 6. Resend (Transactional Email)

| Item              | Detail                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| **Purpose**       | Send automated emails — assignment notifications, weekly status reports, overdue alerts                       |
| **Used For**      | 3 email types: new request assignment, weekly scrum digest (Monday 8 AM), overdue request alerts (daily 9 AM) |
| **Website**       | https://resend.com                                                                                            |
| **Pricing**       | **Free tier**: 100 emails/day, 3,000 emails/month. **Pro**: $20/month for 50,000 emails/month                 |
| **Usage Pattern** | Low volume — a few emails per day for assignments + 1 weekly digest + daily overdue check                     |
| **Keys Required** | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`                                                     |
| **Setup**         | Requires domain verification (DNS records) for custom sender address                                          |

**Monthly Estimated Cost: $0** (free tier likely sufficient)

---

## 7. Redis (Job Queue Infrastructure)

| Item             | Detail                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Purpose**      | Message broker for Bull job queues — manages background task scheduling and processing                            |
| **Used For**     | 6 job queues: permit scraping, weekly scrum, overdue checker, PDL enrichment, email verification, geocoding       |
| **Pricing**      | **Free** locally (`redis://localhost:6379`). In production: Railway Redis plugin (~$5/month) or Upstash free tier |
| **Key Required** | `REDIS_URL`                                                                                                       |

**Monthly Estimated Cost: $0–$5**

---

## Cost Summary

| Service                                   | Monthly Estimate | Required?      | Free Tier Available? |
| ----------------------------------------- | ---------------- | -------------- | -------------------- |
| **Supabase** (DB + Auth)                  | $25              | **Yes — core** | Yes (limited)        |
| **Anthropic** (AI Research)               | $50–$200         | **Yes — core** | No                   |
| **People Data Labs** (Contact Enrichment) | $50–$300         | Optional       | Yes (100 calls/mo)   |
| **NeverBounce** (Email Verification)      | $10–$50          | Optional       | No                   |
| **Google Cloud** (Maps + Sheets)          | $0–$25           | Optional       | Yes ($200 credit/mo) |
| **Resend** (Email)                        | $0               | **Yes — core** | Yes (3,000/mo)       |
| **Redis**                                 | $0–$5            | **Yes — core** | Yes (local)          |
|                                           |                  |                |                      |
| **Total (Core only)**                     | **$75–$230/mo**  |                |                      |
| **Total (All services)**                  | **$135–$605/mo** |                |                      |

---

## Credentials Checklist

| #   | Credential             | Source                        | Priority      |
| --- | ---------------------- | ----------------------------- | ------------- |
| 1   | `SUPABASE_URL`         | supabase.com dashboard        | **Must have** |
| 2   | `SUPABASE_SERVICE_KEY` | supabase.com > Settings > API | **Must have** |
| 3   | `SUPABASE_ANON_KEY`    | supabase.com > Settings > API | **Must have** |
| 4   | `ANTHROPIC_API_KEY`    | console.anthropic.com         | **Must have** |
| 5   | `RESEND_API_KEY`       | resend.com/api-keys           | **Must have** |
| 6   | `PDL_API_KEY`          | dashboard.peopledatalabs.com  | Nice to have  |
| 7   | `NEVERBOUNCE_API_KEY`  | app.neverbounce.com           | Nice to have  |
| 8   | `GOOGLE_MAPS_API_KEY`  | console.cloud.google.com      | Nice to have  |
| 9   | `GOOGLE_CLIENT_ID`     | console.cloud.google.com      | Nice to have  |
| 10  | `GOOGLE_CLIENT_SECRET` | console.cloud.google.com      | Nice to have  |
| 11  | `REDIS_URL`            | Local or Railway              | **Must have** |

---

## Notes

- **No data leaves the platform** — all API calls are server-side only; no API keys are exposed to the browser.
- **Rate limiting is built in** — all batch jobs include delays (100–200ms) to stay within API rate limits.
- **Graceful degradation** — features that depend on optional services (PDL, NeverBounce, Geocoding) will show errors but won't crash the app if keys are missing.
- **All services use HTTPS** — encrypted in transit.
- **Supabase Google Auth** — requires a separate Google OAuth client configured in the Supabase dashboard for team member sign-in (different from the Sheets OAuth client).

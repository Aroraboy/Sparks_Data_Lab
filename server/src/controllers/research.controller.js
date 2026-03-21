import { z } from 'zod';
import * as db from '../db/queries.js';
import {
  preprocessWithHaiku,
  callOpus,
  calculateCost,
} from '../services/anthropic.service.js';

const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

const RESEARCH_MODES = [
  'Full Research Plan',
  'Sources Only',
  'Validation Checklist',
  'Outreach Strategy',
];

const researchSchema = z.object({
  query: z.string().min(10).max(2000),
  mode: z.enum(RESEARCH_MODES),
  request_type: z.string().optional().nullable(),
  market: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  request_id: z.string().uuid().optional().nullable(),
});

const MODE_SYSTEM_PROMPTS = {
  'Full Research Plan': `You are a senior data research strategist for SPARKS DataLab, supporting construction and real estate companies (TX Sparks Construction, SuperConstruct, REF — Real Estate Forum, Leezaspace).

Generate a comprehensive research plan with:
1. **Executive Summary** — 2-3 sentence overview
2. **Research Objectives** — numbered list of specific goals  
3. **Data Sources** — where to find the data (PDL, permit portals, LinkedIn, Google Maps, public records, etc.)
4. **Methodology** — step-by-step approach
5. **Expected Deliverables** — what the final dataset/report will contain
6. **Timeline Estimate** — realistic timeframe
7. **Risks & Mitigations** — potential blockers

Be specific to the construction/real estate domain. Reference real tools and data platforms.`,

  'Sources Only': `You are a data sourcing specialist for SPARKS DataLab.

For the given research query, provide a detailed list of data sources:
- **Primary Sources** — direct databases and APIs (PDL, permit portals, MLS, etc.)
- **Secondary Sources** — public records, news, industry reports
- **People Sources** — LinkedIn, company websites, conference attendee lists
- **Verification Sources** — NeverBounce, Google Maps, phone validation

For each source, provide: name, URL (if applicable), data available, estimated volume, and access method.`,

  'Validation Checklist': `You are a data quality analyst for SPARKS DataLab.

Create a validation checklist for the research query:
1. **Data Completeness** — required fields and acceptable fill rates
2. **Email Verification** — NeverBounce status categories and thresholds
3. **Phone Validation** — format checks, carrier lookup suggestions
4. **Address Verification** — Google Maps geocoding validation steps
5. **Deduplication** — matching criteria and merge rules
6. **Freshness Check** — how to verify data recency
7. **Quality Score** — scoring rubric for overall dataset quality

Be specific and actionable with pass/fail criteria.`,

  'Outreach Strategy': `You are a B2B outreach strategist for construction and real estate companies.

Create an outreach strategy for the given research query:
1. **Target Segments** — who to contact and why
2. **Prioritization** — tier contacts by relevance and likelihood
3. **Channel Strategy** — email, phone, LinkedIn approach for each segment
4. **Messaging Templates** — 2-3 email/message templates
5. **Sequence Timing** — follow-up cadence
6. **Tracking Metrics** — what to measure
7. **Compliance Notes** — CAN-SPAM, opt-out handling`,
};

export async function runResearch(req, res) {
  try {
    const parsed = researchSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
    }

    const { query, mode, request_type, market, company, request_id } = parsed.data;

    // Step 1: Preprocess with Haiku
    let haikuResult;
    try {
      haikuResult = await preprocessWithHaiku(query, { mode, request_type, market, company });
    } catch (err) {
      log(`Haiku preprocessing failed: ${err.message}`);
      // Continue without preprocessing — use raw query
      haikuResult = { text: '', inputTokens: 0, outputTokens: 0 };
    }

    // Step 2: Build Opus prompt
    const systemPrompt = MODE_SYSTEM_PROMPTS[mode];
    let enrichedQuery = query;
    if (haikuResult.text) {
      enrichedQuery = `Original Query: ${query}\n\nPreprocessed Context: ${haikuResult.text}`;
    }
    if (market) enrichedQuery += `\nMarket: ${market}`;
    if (company) enrichedQuery += `\nCompany: ${company}`;
    if (request_type) enrichedQuery += `\nRequest Type: ${request_type}`;

    // Step 3: Call Opus
    const opusResult = await callOpus(systemPrompt, enrichedQuery);

    // Step 4: Calculate cost
    const totalHaikuTokens = haikuResult.inputTokens + haikuResult.outputTokens;
    const totalOpusTokens = opusResult.inputTokens + opusResult.outputTokens;
    const estimatedCost = calculateCost(
      haikuResult.inputTokens, haikuResult.outputTokens,
      opusResult.inputTokens, opusResult.outputTokens
    );

    // Step 5: Save session
    const session = await db.insertResearchSession({
      user_id: req.user.id,
      request_id: request_id || null,
      query,
      mode,
      request_type: request_type || null,
      market: market || null,
      company: company || null,
      ai_response: opusResult.text,
      haiku_tokens: totalHaikuTokens,
      opus_tokens: totalOpusTokens,
      estimated_cost: estimatedCost,
    });

    return res.status(201).json({
      data: {
        id: session.id,
        query,
        mode,
        ai_response: opusResult.text,
        haiku_tokens: totalHaikuTokens,
        opus_tokens: totalOpusTokens,
        estimated_cost: estimatedCost,
        created_at: session.created_at,
      },
    });
  } catch (err) {
    log(`runResearch error: ${err.message}`);
    return res.status(500).json({ error: 'Research failed. Please try again.' });
  }
}

export async function getHistory(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const sessions = await db.getResearchSessions(req.user.id, limit);
    return res.json({ data: sessions });
  } catch (err) {
    log(`getHistory error: ${err.message}`);
    return res.status(500).json({ error: 'Failed to fetch research history' });
  }
}

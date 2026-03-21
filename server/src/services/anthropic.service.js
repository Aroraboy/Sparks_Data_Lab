import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
const OPUS_MODEL = 'claude-opus-4-5';

// Pricing per 1M tokens (USD)
const PRICING = {
  haiku: { input: 1.00, output: 5.00 },
  opus: { input: 15.00, output: 75.00 },
};

/**
 * Preprocess user prompt with Haiku to extract structured intent.
 * Returns a refined system prompt for Opus.
 */
export async function preprocessWithHaiku(userPrompt, context = {}) {
  const systemPrompt = `You are an internal preprocessing assistant for SPARKS DataLab, a data operations platform for construction and real estate companies.
Your job: analyze the user's research query and produce a concise, structured brief that a senior research AI (Claude Opus) will use to generate a full response.

Extract and return as JSON:
{
  "refined_query": "the cleaned-up research question",
  "research_type": "one of: market analysis, contact research, permit intelligence, competitor analysis, general research",
  "key_entities": ["list of companies, people, locations, or topics to research"],
  "output_format": "what the user wants: report, list, table, checklist, strategy",
  "constraints": "any filters: market, date range, company focus, etc."
}`;

  const response = await client.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Research query: "${userPrompt}"

Context:
- Mode: ${context.mode || 'Full Research Plan'}
- Request type: ${context.request_type || 'General'}
- Market: ${context.market || 'Not specified'}
- Company: ${context.company || 'Not specified'}`,
      },
    ],
  });

  const text = response.content[0]?.text || '';
  const inputTokens = response.usage?.input_tokens || 0;
  const outputTokens = response.usage?.output_tokens || 0;

  return { text, inputTokens, outputTokens };
}

/**
 * Stream a full research response from Opus.
 * Returns an async generator that yields text chunks.
 */
export async function streamWithOpus(systemPrompt, userPrompt) {
  const stream = client.messages.stream({
    model: OPUS_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  return stream;
}

/**
 * Non-streaming Opus call (for simpler use cases).
 */
export async function callOpus(systemPrompt, userPrompt) {
  const response = await client.messages.create({
    model: OPUS_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = response.content[0]?.text || '';
  const inputTokens = response.usage?.input_tokens || 0;
  const outputTokens = response.usage?.output_tokens || 0;

  return { text, inputTokens, outputTokens };
}

/**
 * Calculate estimated cost from token counts.
 */
export function calculateCost(haikuIn, haikuOut, opusIn, opusOut) {
  const haikuCost =
    (haikuIn / 1_000_000) * PRICING.haiku.input +
    (haikuOut / 1_000_000) * PRICING.haiku.output;
  const opusCost =
    (opusIn / 1_000_000) * PRICING.opus.input +
    (opusOut / 1_000_000) * PRICING.opus.output;
  return parseFloat((haikuCost + opusCost).toFixed(4));
}

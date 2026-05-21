require('dotenv').config();
const pdfParse = require('pdf-parse');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function parseLoadingList(pdfBuffer) {
  const data = await pdfParse(pdfBuffer);
  const text = data.text;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `You are a data extraction assistant. Extract every delivery stop from the loading list below.

Return ONLY a valid JSON array — no explanation, no markdown, no code fences. Each object must have exactly these fields:
- "stopNr"  : stop number as a string (e.g. "1")
- "detail"  : stop position tag like TAIL, NOSE, B/S — empty string if absent
- "company" : the Deliver To company name
- "city"    : city name
- "state"   : 2-letter state abbreviation
- "order"   : full order number including any letter prefix (e.g. "S0000045445") — empty string if not found

Loading list:
${text}`
    }]
  });

  let raw = message.content[0].text.trim();
  raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(raw);
}

module.exports = { parseLoadingList };

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildPrompt(text) {
  return `Extract ALL stops from this loading list — do not skip any stop. Reply with ONLY a JSON object, no markdown, no truncation.

Schema: {"loadId":"last 6 digits of Load ID or empty","stops":[{"stopNr":"1","detail":"TAIL or empty","company":"","city":"","state":"CA","order":"S0000045445 or empty"}]}

Loading list:
${text}`;
}

function countStopsInText(text) {
  return (text.match(/Stop\s*nr\.?\s*:/gi) || []).length;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No PDF text provided.' });

  const expectedCount = countStopsInText(text);

  async function callClaude() {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: buildPrompt(text) }]
    });
    let raw = message.content[0].text.trim();
    raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(raw);
  }

  try {
    let result = await callClaude();

    // If we know how many stops to expect and got fewer, retry once
    if (expectedCount > 0 && result.stops.length < expectedCount) {
      console.warn(`Expected ${expectedCount} stops, got ${result.stops.length}. Retrying…`);
      result = await callClaude();
    }

    const { loadId, stops } = result;

    if (stops.length > 0) {
      stops[stops.length - 1].loadId = loadId || '';
    }

    res.json({ stops });
  } catch (err) {
    console.error('Parse error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

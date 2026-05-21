const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No PDF text provided.' });

  try {
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
    const stops = JSON.parse(raw);
    res.json({ stops });
  } catch (err) {
    console.error('Parse error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

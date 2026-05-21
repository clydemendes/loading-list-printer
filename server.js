require('dotenv').config();
const express  = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path     = require('path');

const app    = express();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

app.post('/api/parse', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No PDF text provided.' });

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `You are a data extraction assistant. Extract data from the loading list below.

Return ONLY a valid JSON object — no explanation, no markdown, no code fences — with exactly these two fields:

1. "loadId": the last 6 digits of the Load ID field found in the document (e.g. if Load ID is "LD-789123", return "789123"). Empty string if not found.

2. "stops": an array of objects, one per delivery stop, each with exactly these fields:
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

    const { loadId, stops } = JSON.parse(raw);

    // Attach loadId only to stop #1
    if (stops.length > 0) {
      stops[0].loadId = loadId || '';
    }

    res.json({ stops });
  } catch (err) {
    console.error('Parse error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅  Loading List Printer → http://localhost:${PORT}\n`);
});

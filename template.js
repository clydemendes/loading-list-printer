function companyFontSize(name) {
  const len = name.length;
  if (len <= 15) return '56pt';
  if (len <= 22) return '46pt';
  if (len <= 30) return '38pt';
  if (len <= 40) return '30pt';
  return '24pt';
}

function generatePrintHTML(stops) {
  const cards = stops.map(s => {
    const location = [s.city, s.state].filter(Boolean).join(', ');
    const header   = s.detail
      ? `STOP #${s.stopNr} <span class="detail-tag">(${s.detail})</span>`
      : `STOP #${s.stopNr}`;
    return `
    <div class="stop-card">
      <div class="stop-header">${header}</div>
      <div class="company" style="font-size:${companyFontSize(s.company)}">${s.company}</div>
      ${location ? `<div class="location">${location}</div>` : ''}
      <hr class="divider">
      <div class="order-label">Order Number</div>
      ${s.order ? `<div class="order-number">${s.order}</div>` : '<div class="order-number no-order">—</div>'}
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { size: letter landscape; margin: 0.35in; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #fff; }

  .stop-card {
    background: #fff;
    height: 7.8in;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0.25in 0.5in;
    page-break-after: always;
    break-after: page;
    font-family: 'Arial Black', Arial, sans-serif;
    color: #000;
    overflow: hidden;
  }

  .stop-header {
    font-size: 14pt;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #000;
    margin-bottom: 0.15in;
  }
  .detail-tag { color: #444; }

  .company {
    font-size: 56pt;
    font-weight: 900;
    line-height: 1.0;
    color: #000;
    margin-bottom: 0.08in;
  }

  .location {
    font-size: 30pt;
    font-weight: 700;
    color: #000;
    margin-bottom: 0.2in;
  }

  .divider {
    border: none;
    border-top: 2px solid #000;
    margin-bottom: 0.15in;
  }

  .order-label {
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #000;
    margin-bottom: 0.06in;
  }

  .order-number {
    font-size: 46pt;
    font-weight: 900;
    color: #000;
    letter-spacing: 2px;
  }
  .order-number.no-order { color: #999; }
</style>
</head>
<body>${cards}</body>
</html>`;
}

module.exports = { generatePrintHTML };

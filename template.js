function companyFontSize(name) {
  const len = name.length;
  if (len <= 15) return '56pt';
  if (len <= 22) return '46pt';
  if (len <= 30) return '38pt';
  if (len <= 40) return '30pt';
  return '24pt';
}

function orderFontSize(count) {
  if (count <= 1) return '46pt';
  if (count === 2) return '36pt';
  if (count === 3) return '28pt';
  return '22pt';
}

// A stop carries either a single `order` or, once combined, an `orders` array.
function stopOrders(s) {
  if (Array.isArray(s.orders) && s.orders.length) return s.orders.filter(Boolean);
  return s.order ? [s.order] : [];
}

function stopNum(s) {
  const n = parseInt(s.stopNr);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

const COPIES = 4;

function generatePrintHTML(stops) {
  // Sort by stop number, then reverse so last stop prints first,
  // repeating each stop COPIES times (uncollated)
  const cards = [...stops].sort((a, b) => stopNum(a) - stopNum(b)).reverse().flatMap(s => {
    const location = [s.city, s.state].filter(Boolean).join(', ');
    const header   = s.detail
      ? `STOP #${s.stopNr} <span class="detail-tag">(${s.detail})</span>`
      : `STOP #${s.stopNr}`;
    const orders   = stopOrders(s);
    const orderBlock = orders.length
      ? `<div class="order-label">Order Number${orders.length > 1 ? 's' : ''}</div>
      <div class="order-list">${orders.map(o =>
        `<div class="order-number" style="font-size:${orderFontSize(orders.length)}">${o}</div>`).join('')}</div>`
      : `<div class="order-label">Order Number</div>
      <div class="order-number no-order">—</div>`;
    const card = `
    <div class="stop-card">
      ${s.loadId ? `<div class="load-id">${s.loadId}</div>` : ''}
      <div class="stop-header">${header}</div>
      <div class="company" style="font-size:${companyFontSize(s.company)}">${s.company}</div>
      ${location ? `<div class="location">${location}</div>` : ''}
      <hr class="divider">
      ${orderBlock}
    </div>`;
    return Array(COPIES).fill(card);
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
    position: relative;
  }

  .load-id {
    position: absolute;
    top: 0.25in;
    right: 0.5in;
    font-size: 19pt;
    font-weight: 700;
    color: #000;
    letter-spacing: 1px;
  }

  .stop-header {
    font-size: 46pt;
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
    line-height: 1.1;
  }
  .order-number.no-order { color: #999; }
  .order-list .order-number + .order-number { margin-top: 0.04in; }
</style>
</head>
<body>${cards}</body>
</html>`;
}

module.exports = { generatePrintHTML };

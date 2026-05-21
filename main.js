const fs = require('fs');
const path = require('path');
const { parseLoadingList } = require('./parser');
const { generatePrintHTML } = require('./template');

async function run() {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error('Usage: node main.js <path-to-pdf>');
    process.exit(1);
  }

  const buffer = fs.readFileSync(pdfPath);
  const stops  = await parseLoadingList(buffer);

  console.log(`\nFound ${stops.length} stops:\n`);
  stops.forEach(s => {
    console.log(`  Stop #${s.stopNr} → ${s.company} (${s.city}, ${s.state}) | Order: ${s.order}`);
  });

  const html = generatePrintHTML(stops);
  const outPath = path.join(__dirname, 'print_stops.html');
  fs.writeFileSync(outPath, html);
  console.log(`\n✅ Print file saved: ${outPath}`);
  console.log('   Open it in your browser and press Ctrl+P / Cmd+P to print.\n');
}

run();

const fs = require('fs');
const path = require('path');

const apiUrl = process.env.API_URL || 'http://localhost:8081/api';
const outputDir = path.join(__dirname, '..', 'src', 'assets');
const outputFile = path.join(outputDir, 'env.js');

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  outputFile,
  `window.__APP_CONFIG__ = { apiUrl: ${JSON.stringify(apiUrl)} };\n`,
  'utf8'
);

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_DIR = path.join(__dirname, '../data/rfps');

const ensureDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

const safeExtFromName = (filename = '') => {
  const name = String(filename || '').toLowerCase();
  if (name.endsWith('.pdf')) return '.pdf';
  if (name.endsWith('.docx')) return '.docx';
  if (name.endsWith('.md')) return '.md';
  return '.txt';
};

const writeRfpBundle = ({ filename, mimetype, buffer, extractedText, summary }) => {
  ensureDir();
  const id = randomUUID();
  const ext = safeExtFromName(filename);
  const base = path.join(DATA_DIR, id);

  fs.writeFileSync(`${base}${ext}`, buffer);
  fs.writeFileSync(`${base}.extracted.txt`, extractedText || '');
  fs.writeFileSync(`${base}.summary.json`, JSON.stringify(summary || {}, null, 2));

  const meta = {
    id,
    filename: filename || '',
    mimetype: mimetype || '',
    ext,
    storedAt: new Date().toISOString(),
    extractedChars: (extractedText || '').length
  };
  fs.writeFileSync(`${base}.meta.json`, JSON.stringify(meta, null, 2));

  return meta;
};

module.exports = {
  writeRfpBundle
};


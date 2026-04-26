const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const MAX_EXTRACT_CHARS = 20000;

const cleanText = (text) =>
  String(text || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const truncate = (text, maxChars = MAX_EXTRACT_CHARS) => {
  const cleaned = cleanText(text);
  if (cleaned.length <= maxChars) {
    return { text: cleaned, truncated: false, maxChars };
  }

  return {
    text: cleaned.slice(0, maxChars),
    truncated: true,
    maxChars
  };
};

const extractTextFromBuffer = async ({ buffer, filename = '', mimetype = '' }) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Missing file data');
  }

  const name = String(filename || '').toLowerCase();
  const type = String(mimetype || '').toLowerCase();

  // TXT / MD
  if (type.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.md')) {
    return truncate(buffer.toString('utf8'));
  }

  // PDF
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    const result = await pdfParse(buffer);
    return truncate(result.text);
  }

  // DOCX
  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return truncate(result.value);
  }

  throw new Error('Unsupported file type. Please upload PDF, DOCX, TXT, or MD.');
};

module.exports = {
  extractTextFromBuffer,
  MAX_EXTRACT_CHARS
};


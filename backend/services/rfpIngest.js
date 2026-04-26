const { extractTextFromBuffer } = require('./rfpExtract');
const { summarizeRfpText } = require('./rfpSummarize');
const { writeRfpBundle } = require('./rfpStore');

const ingestRfpFile = async (file) => {
  if (!file || !file.buffer) {
    throw new Error('file is required');
  }

  const extracted = await extractTextFromBuffer({
    buffer: file.buffer,
    filename: file.originalname,
    mimetype: file.mimetype
  });

  const summary = await summarizeRfpText(extracted.text);
  const meta = writeRfpBundle({
    filename: file.originalname,
    mimetype: file.mimetype,
    buffer: file.buffer,
    extractedText: extracted.text,
    summary
  });

  return {
    rfp: {
      id: meta.id,
      filename: meta.filename,
      mimetype: meta.mimetype,
      storedAt: meta.storedAt,
      extractedChars: meta.extractedChars,
      truncated: extracted.truncated,
      maxChars: extracted.maxChars,
      summary
    }
  };
};

module.exports = {
  ingestRfpFile
};


const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const settingsService = require('./services/settings');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

const isPlausibleKey = (k) => {
  const s = String(k || '').trim();
  return s.startsWith('sk-') && !s.includes('your_');
};

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  const envKey = process.env.OPENAI_API_KEY;
  if (isPlausibleKey(envKey)) {
    console.log('[LLM] API key: CONFIGURED via environment variable — real OpenAI calls enabled');
    return;
  }
  try {
    const settings = await settingsService.getSettings();
    if (isPlausibleKey(settings.openaiApiKey)) {
      console.log('[LLM] API key: CONFIGURED via Settings — real OpenAI calls enabled');
    } else {
      console.log('[LLM] API key: NOT configured — mock responses will be used. Add key in Settings > AI Settings.');
    }
  } catch {
    console.log('[LLM] API key: NOT configured — mock responses will be used.');
  }
});
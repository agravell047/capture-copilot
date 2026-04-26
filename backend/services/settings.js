const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/settings.json');

const DEFAULT_SETTINGS = {
  openaiApiKey: '',
  model: '',
  baseUrl: ''
};

const ensureDataFile = () => {
  const directory = path.dirname(DATA_FILE);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
  }
};

const getSettings = async () => {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SETTINGS };
    return {
      ...DEFAULT_SETTINGS,
      ...parsed
    };
  } catch (error) {
    console.error('[Settings] Error reading file:', error.message);
    return { ...DEFAULT_SETTINGS };
  }
};

const updateSettings = async (incoming = {}) => {
  if (!incoming || typeof incoming !== 'object') {
    throw new Error('Settings must be an object');
  }

  const current = await getSettings();
  const next = {
    ...current,
    openaiApiKey: incoming.openaiApiKey !== undefined ? String(incoming.openaiApiKey || '').trim() : current.openaiApiKey,
    model: incoming.model !== undefined ? String(incoming.model || '').trim() : current.model,
    baseUrl: incoming.baseUrl !== undefined ? String(incoming.baseUrl || '').trim() : current.baseUrl
  };

  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(next, null, 2));
  return next;
};

module.exports = {
  getSettings,
  updateSettings
};


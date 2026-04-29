const fs = require('fs');
const path = require('path');
const { PastPerformance } = require('../models/pastPerformance');

const DATA_FILE = path.join(__dirname, '../data/pastPerformance.json');

const ensureDataFile = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
};

const readAll = () => {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => new PastPerformance(item).toJSON());
  } catch (error) {
    console.error('[PastPerformance] Error reading file:', error.message);
    return [];
  }
};

const writeAll = (records) => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
};

const listPastPerformance = async () => {
  return readAll().sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime());
};

const getPastPerformanceById = async (id) => {
  if (!id) return null;
  return readAll().find((r) => r.id === id) || null;
};

const getByOpportunityId = async (opportunityId) => {
  if (!opportunityId) return null;
  return readAll().find((r) => r.opportunityId === opportunityId) || null;
};

const createPastPerformance = async (data) => {
  const records = readAll();
  const existing = records.find((r) => r.opportunityId === data.opportunityId);
  if (existing) {
    throw new Error('Past performance record already exists for this opportunity');
  }
  const record = new PastPerformance(data).toJSON();
  records.push(record);
  writeAll(records);
  return record;
};

const updatePastPerformance = async (id, data) => {
  const records = readAll();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Past performance record not found');
  const updated = new PastPerformance({ ...records[index], ...data, id }).toJSON();
  records[index] = updated;
  writeAll(records);
  return updated;
};

/**
 * Score similarity between a candidate opportunity and a past performance record.
 * Returns a score 0–100. Higher = more similar.
 * Weights: agency (40) > vehicle (25) > setAside (20) > contractValue (10) > capabilities (5 each, max 5)
 */
const scoreSimilarity = (opportunity, record) => {
  let score = 0;
  if (opportunity.agency && record.agency && opportunity.agency === record.agency) score += 40;
  if (opportunity.vehicle && record.vehicle && opportunity.vehicle === record.vehicle) score += 25;
  if (opportunity.setAside && record.setAside && opportunity.setAside === record.setAside) score += 20;
  if (opportunity.contractValue && record.contractValue && opportunity.contractValue === record.contractValue) score += 10;

  if (Array.isArray(opportunity.capabilities) && Array.isArray(record.capabilities)) {
    const matches = opportunity.capabilities.filter((c) => record.capabilities.includes(c));
    score += Math.min(matches.length * 5, 5);
  }

  return score;
};

/**
 * Return up to `limit` past performance records most similar to the given opportunity.
 * Excludes the opportunity's own past performance record (if any).
 * Only returns records with at least one matching dimension (score > 0).
 */
const findSimilar = async (opportunity, limit = 3) => {
  const records = readAll();

  const scored = records
    .filter((r) => r.opportunityId !== opportunity.id)
    .map((r) => ({ record: r, score: scoreSimilarity(opportunity, r) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ record }) => record);
};

module.exports = {
  listPastPerformance,
  getPastPerformanceById,
  getByOpportunityId,
  createPastPerformance,
  updatePastPerformance,
  findSimilar
};

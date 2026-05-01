const fs = require('fs');
const path = require('path');
const { Opportunity, OPPORTUNITY_FIELDS } = require('../models/opportunity');

const DATA_FILE = path.join(__dirname, '../data/opportunities.json');

const ensureDataFile = () => {
  const directory = path.dirname(DATA_FILE);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
};

const readOpportunities = () => {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => Opportunity.create(item).toJSON());
  } catch (error) {
    console.error('[Opportunities] Error reading file:', error.message);
    return [];
  }
};

const writeOpportunities = (opportunities) => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(opportunities, null, 2));
};

const getOpportunityById = async (id) => {
  if (!id) {
    return null;
  }

  const opportunities = readOpportunities();
  return opportunities.find((opportunity) => opportunity.id === id) || null;
};

const listOpportunities = async () => {
  return readOpportunities()
    .slice()
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
};

const upsertOpportunity = async (opportunityData = {}) => {
  const opportunities = readOpportunities();
  const existingIndex = opportunityData.id
    ? opportunities.findIndex((opportunity) => opportunity.id === opportunityData.id)
    : -1;

  const nextOpportunity = existingIndex >= 0
    ? Opportunity.merge(opportunities[existingIndex], opportunityData).toJSON()
    : Opportunity.create(opportunityData).toJSON();

  if (existingIndex >= 0) {
    opportunities[existingIndex] = nextOpportunity;
  } else {
    opportunities.push(nextOpportunity);
  }

  writeOpportunities(opportunities);
  return nextOpportunity;
};

const appendUpdate = async (opportunityId, updateData = {}) => {
  const opportunities = readOpportunities();
  const opportunityIndex = opportunities.findIndex((opportunity) => opportunity.id === opportunityId);

  if (opportunityIndex === -1) {
    throw new Error('Opportunity not found');
  }

  const currentOpportunity = opportunities[opportunityIndex];
  const update = Opportunity.buildUpdate(updateData, currentOpportunity);
  const fieldPatch = {};

  if (update.type === 'field_update' && update.field && OPPORTUNITY_FIELDS.includes(update.field)) {
    fieldPatch[update.field] = update.newValue === undefined ? '' : update.newValue;
  }

  const nextOpportunity = Opportunity.merge(currentOpportunity, {
    ...fieldPatch,
    updates: [...(currentOpportunity.updates || []), update]
  }).toJSON();

  opportunities[opportunityIndex] = nextOpportunity;
  writeOpportunities(opportunities);

  return { opportunity: nextOpportunity, update };
};

const deleteOpportunity = (opportunityId) => {
  const opportunities = readOpportunities();
  const index = opportunities.findIndex((o) => o.id === opportunityId);
  if (index === -1) return false;
  opportunities.splice(index, 1);
  writeOpportunities(opportunities);
  return true;
};

const attachLatestAnalysis = async (opportunityId, latestAnalysis) => {
  return upsertOpportunity({
    id: opportunityId,
    latestAnalysis
  });
};

module.exports = {
  listOpportunities,
  getOpportunityById,
  upsertOpportunity,
  appendUpdate,
  attachLatestAnalysis,
  deleteOpportunity
};

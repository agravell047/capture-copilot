const { randomUUID } = require('crypto');

const OUTCOMES = ['won', 'lost', 'no_bid', 'withdrew'];

const LOSS_REASONS = [
  'price',
  'technical',
  'past_performance',
  'relationship',
  'scope_mismatch',
  'timeline',
  'other'
];

const LESSON_TAGS = [
  'pricing',
  'capability_gap',
  'relationship',
  'timeline',
  'proposal_quality',
  'scope_mismatch'
];

const normalizeLessons = (lessons = []) => {
  if (!Array.isArray(lessons)) return [];
  return lessons
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const tag = LESSON_TAGS.includes(item.tag) ? item.tag : null;
      const note = String(item.note || '').trim();
      if (!tag || !note) return null;
      return { tag, note };
    })
    .filter(Boolean);
};

class PastPerformance {
  constructor(data = {}) {
    const timestamp = new Date().toISOString();
    this.id = data.id || randomUUID();
    this.opportunityId = String(data.opportunityId || '').trim();
    this.opportunityName = String(data.opportunityName || '').trim();
    this.agency = String(data.agency || '').trim();
    this.vehicle = String(data.vehicle || '').trim();
    this.setAside = String(data.setAside || 'None').trim();
    this.contractValue = String(data.contractValue || '<5M').trim();
    this.capabilities = Array.isArray(data.capabilities)
      ? data.capabilities.map((c) => String(c).trim()).filter(Boolean)
      : [];
    this.outcome = OUTCOMES.includes(data.outcome) ? data.outcome : null;
    this.lossReason = LOSS_REASONS.includes(data.lossReason) ? data.lossReason : null;
    this.lessonsLearned = normalizeLessons(data.lessonsLearned);
    this.notes = String(data.notes || '').trim();
    this.closedAt = data.closedAt || timestamp;
    this.createdAt = data.createdAt || timestamp;
  }

  toJSON() {
    return {
      id: this.id,
      opportunityId: this.opportunityId,
      opportunityName: this.opportunityName,
      agency: this.agency,
      vehicle: this.vehicle,
      setAside: this.setAside,
      contractValue: this.contractValue,
      capabilities: this.capabilities,
      outcome: this.outcome,
      lossReason: this.lossReason,
      lessonsLearned: this.lessonsLearned,
      notes: this.notes,
      closedAt: this.closedAt,
      createdAt: this.createdAt
    };
  }
}

module.exports = { PastPerformance, OUTCOMES, LOSS_REASONS, LESSON_TAGS };

const { randomUUID } = require('crypto');

const UPDATE_TYPES = ['note', 'relationship', 'risk', 'capability', 'field_update'];
const FIELD_ALIASES = {
  name: 'opportunityName'
};
const OPPORTUNITY_FIELDS = [
  'opportunityName',
  'agency',
  'contractValue',
  'vehicle',
  'setAside',
  'timeline',
  'description',
  'knownRelationships',
  'notes'
];

const normalizeGate = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  if (num < 0) return 0;
  if (num > 3) return 3;
  return Math.floor(num);
};

const normalizeEvidence = (evidence = []) => {
  if (!Array.isArray(evidence)) return [];
  return evidence
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const url = String(item.url || '').trim();
      const note = String(item.note || '').trim();
      if (!url && !note) return null;
      return {
        id: item.id || randomUUID(),
        source: String(item.source || '').trim() || 'Other',
        url,
        note,
        summary: item.summary ? String(item.summary).trim() : ''
      };
    })
    .filter(Boolean);
};

const normalizeStakeholders = (stakeholders = []) => {
  if (!Array.isArray(stakeholders)) return [];
  return stakeholders
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const name = String(item.name || '').trim();
      if (!name) return null;
      const strength = ['weak', 'moderate', 'strong'].includes(String(item.relationshipStrength || '').toLowerCase())
        ? String(item.relationshipStrength).toLowerCase()
        : 'moderate';
      return {
        id: item.id || randomUUID(),
        name,
        role: String(item.role || '').trim(),
        office: String(item.office || '').trim(),
        relationshipStrength: strength,
        lastTouch: String(item.lastTouch || '').trim(),
        nextTouch: String(item.nextTouch || '').trim(),
        notes: String(item.notes || '').trim()
      };
    })
    .filter(Boolean);
};

const normalizeEvaluation = (evaluation = null) => {
  if (!evaluation || typeof evaluation !== 'object') {
    return {
      type: '',
      criteria: [],
      notes: ''
    };
  }

  return {
    type: String(evaluation.type || '').trim(),
    criteria: Array.isArray(evaluation.criteria)
      ? evaluation.criteria.map((c) => String(c || '').trim()).filter(Boolean).slice(0, 12)
      : [],
    notes: String(evaluation.notes || '').trim()
  };
};

const normalizeFieldName = (field) => FIELD_ALIASES[field] || field;

const pickOpportunityFields = (source = {}) => {
  const next = {};

  if (source.name && !source.opportunityName) {
    next.opportunityName = source.name;
  }

  for (const field of OPPORTUNITY_FIELDS) {
    const sourceField = normalizeFieldName(field);

    if (Object.prototype.hasOwnProperty.call(source, sourceField)) {
      next[field] = source[sourceField];
    }
  }

  return next;
};

class Opportunity {
  constructor(data = {}) {
    const timestamp = new Date().toISOString();

    this.id = data.id || randomUUID();
    this.createdAt = data.createdAt || timestamp;
    this.updatedAt = data.updatedAt || timestamp;

    for (const field of OPPORTUNITY_FIELDS) {
      this[field] = data[field] || '';
    }

    this.contractValue = data.contractValue || '<5M';
    this.setAside = data.setAside || 'None';
    this.status = data.status === 'archived' ? 'archived' : 'active';
    this.updates = Opportunity.normalizeUpdates(data.updates);
    this.latestAnalysis = data.latestAnalysis || null;
    this.rfp = data.rfp || null;
    this.gate = normalizeGate(data.gate);
    this.evidence = normalizeEvidence(data.evidence);
    this.stakeholders = normalizeStakeholders(data.stakeholders);
    this.evaluation = normalizeEvaluation(data.evaluation);
  }

  static create(data = {}) {
    return new Opportunity({
      ...pickOpportunityFields(data),
      id: data.id,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      status: data.status,
      latestAnalysis: data.latestAnalysis,
      updates: data.updates,
      rfp: data.rfp,
      gate: data.gate,
      evidence: data.evidence,
      stakeholders: data.stakeholders,
      evaluation: data.evaluation
    });
  }

  static merge(existingOpportunity, nextData = {}) {
    return new Opportunity({
      ...existingOpportunity,
      ...pickOpportunityFields(nextData),
      id: existingOpportunity.id,
      createdAt: existingOpportunity.createdAt,
      updatedAt: new Date().toISOString(),
      status: nextData.status || existingOpportunity.status,
      latestAnalysis: nextData.latestAnalysis !== undefined
        ? nextData.latestAnalysis
        : existingOpportunity.latestAnalysis,
      rfp: nextData.rfp !== undefined ? nextData.rfp : existingOpportunity.rfp,
      gate: nextData.gate !== undefined ? nextData.gate : existingOpportunity.gate,
      evidence: nextData.evidence !== undefined ? nextData.evidence : existingOpportunity.evidence,
      stakeholders: nextData.stakeholders !== undefined ? nextData.stakeholders : existingOpportunity.stakeholders,
      evaluation: nextData.evaluation !== undefined ? nextData.evaluation : existingOpportunity.evaluation,
      updates: nextData.updates !== undefined
        ? Opportunity.normalizeUpdates(nextData.updates)
        : Opportunity.normalizeUpdates(existingOpportunity.updates)
    });
  }

  static normalizeUpdates(updates = []) {
    if (!Array.isArray(updates)) {
      return [];
    }

    return updates
      .map((update) => Opportunity.normalizeUpdate(update))
      .filter(Boolean)
      .sort((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime());
  }

  static normalizeUpdate(update = {}) {
    if (!update || typeof update !== 'object') {
      return null;
    }

    const type = UPDATE_TYPES.includes(update.type) ? update.type : 'note';
    const timestamp = update.timestamp || new Date().toISOString();
    const content = String(update.content || '').trim();

    return {
      id: update.id || randomUUID(),
      type,
      timestamp,
      content,
      field: update.field || undefined,
      oldValue: update.oldValue,
      newValue: update.newValue
    };
  }

  static buildUpdate(updateData = {}, currentOpportunity = {}) {
    const baseUpdate = Opportunity.normalizeUpdate(updateData) || {};
    const type = baseUpdate.type || 'note';
    const field = updateData.field ? normalizeFieldName(String(updateData.field).trim()) : undefined;
    const shouldApplyFieldChange = type === 'field_update' && field && OPPORTUNITY_FIELDS.includes(field);

    if (type === 'field_update' && !field) {
      throw new Error('field is required for field_update events');
    }
    if (type === 'field_update' && updateData.newValue === undefined) {
      throw new Error('newValue is required for field_update events');
    }

    const oldValue = shouldApplyFieldChange
      ? currentOpportunity[field]
      : updateData.oldValue;
    const newValue = shouldApplyFieldChange
      ? updateData.newValue
      : updateData.newValue;
    const defaultContent = shouldApplyFieldChange
      ? `${field} updated from "${oldValue || ''}" to "${newValue || ''}".`
      : '';
    const content = String(updateData.content || defaultContent).trim();

    if (!content) {
      throw new Error('Update content is required');
    }

    return {
      ...baseUpdate,
      type,
      field,
      oldValue,
      newValue,
      content
    };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.opportunityName,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      opportunityName: this.opportunityName,
      agency: this.agency,
      contractValue: this.contractValue,
      vehicle: this.vehicle,
      setAside: this.setAside,
      timeline: this.timeline,
      description: this.description,
      knownRelationships: this.knownRelationships,
      notes: this.notes,
      status: this.status,
      gate: this.gate,
      evidence: this.evidence,
      stakeholders: this.stakeholders,
      evaluation: this.evaluation,
      updates: this.updates,
      latestAnalysis: this.latestAnalysis,
      rfp: this.rfp
    };
  }
}

module.exports = {
  Opportunity,
  normalizeFieldName,
  OPPORTUNITY_FIELDS,
  UPDATE_TYPES
};

const { randomUUID } = require('crypto');

const RELATIONSHIP_STRENGTHS = ['weak', 'moderate', 'strong'];

class Contact {
  constructor(data = {}) {
    const timestamp = new Date().toISOString();
    this.id = data.id || randomUUID();
    this.createdAt = data.createdAt || timestamp;
    this.updatedAt = data.updatedAt || timestamp;

    this.name = String(data.name || '').trim();
    this.title = String(data.title || '').trim();
    this.agency = String(data.agency || '').trim();
    this.office = String(data.office || '').trim();
    this.email = String(data.email || '').trim();
    this.phone = String(data.phone || '').trim();
    this.relationshipStrength = RELATIONSHIP_STRENGTHS.includes(data.relationshipStrength)
      ? data.relationshipStrength
      : 'moderate';
    this.lastTouch = String(data.lastTouch || '').trim();
    this.nextTouch = String(data.nextTouch || '').trim();
    this.notes = String(data.notes || '').trim();
  }

  static create(data = {}) {
    return new Contact(data);
  }

  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.name,
      title: this.title,
      agency: this.agency,
      office: this.office,
      email: this.email,
      phone: this.phone,
      relationshipStrength: this.relationshipStrength,
      lastTouch: this.lastTouch,
      nextTouch: this.nextTouch,
      notes: this.notes,
    };
  }
}

module.exports = { Contact, RELATIONSHIP_STRENGTHS };

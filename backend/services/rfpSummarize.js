const { callLLM } = require('../llm/client');

const SYSTEM_PROMPT = `You convert federal RFP text into a compact, structured JSON summary for downstream analysis.

Rules:
- Return ONLY valid JSON (no markdown, no commentary).
- Keep it short and information-dense.
- Use empty arrays/strings when unknown (do not hallucinate).
- Limit list sizes (requirements <= 12, evaluationCriteria <= 8, keyDates <= 8, constraints <= 8).
- Prefer normalized wording and short bullets.`;

const summarizeRfpText = async (text = '') => {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    return {
      overview: '',
      scope: [],
      requirements: [],
      evaluationCriteria: [],
      keyDates: [],
      constraints: [],
      setAside: '',
      vehicle: '',
      customer: '',
      contacts: [],
      notes: ''
    };
  }

  const prompt = `Summarize this RFP text into the exact JSON schema below.

RFP TEXT (may be truncated):
${trimmed}

Return ONLY this JSON schema:
{
  "overview": "1-3 sentences",
  "scope": ["short bullets"],
  "requirements": ["short bullets"],
  "evaluationCriteria": ["short bullets"],
  "keyDates": ["short bullets (include dates if present)"],
  "constraints": ["short bullets (e.g., compliance, security, staffing, location)"],
  "setAside": "string",
  "vehicle": "string",
  "customer": "string",
  "contacts": ["names/roles/emails if present"],
  "notes": "string (only if useful)"
}`;

  const response = await callLLM({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    json: true,
    maxTokens: 900
  });

  const data = response && typeof response === 'object' ? response : {};

  // Defensive normalization to keep shape stable.
  const toCompactString = (item) => {
    if (item === null || item === undefined) return '';
    if (typeof item === 'string') return item.trim();
    if (typeof item === 'number' || typeof item === 'boolean') return String(item);
    if (typeof item === 'object') {
      const candidateKeys = ['text', 'value', 'name', 'requirement', 'criterion', 'date', 'label', 'title'];
      for (const key of candidateKeys) {
        if (typeof item[key] === 'string' && item[key].trim()) {
          return item[key].trim();
        }
      }
      // Fall back to a short JSON string.
      try {
        return JSON.stringify(item).slice(0, 200);
      } catch {
        return '';
      }
    }
    return '';
  };

  const asArray = (value, max) =>
    Array.isArray(value)
      ? value.map(toCompactString).filter(Boolean).slice(0, max)
      : [];

  return {
    overview: toCompactString(data.overview),
    scope: asArray(data.scope, 12),
    requirements: asArray(data.requirements, 12),
    evaluationCriteria: asArray(data.evaluationCriteria, 8),
    keyDates: asArray(data.keyDates, 8),
    constraints: asArray(data.constraints, 8),
    setAside: toCompactString(data.setAside),
    vehicle: toCompactString(data.vehicle),
    customer: toCompactString(data.customer),
    contacts: asArray(data.contacts, 8),
    notes: toCompactString(data.notes)
  };
};

module.exports = {
  summarizeRfpText
};

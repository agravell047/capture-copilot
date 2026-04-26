const { callLLM } = require('../llm/client');

const SYSTEM_PROMPT = `You are a federal proposal analyst extracting structured information from RFP text.

RULES:
- Use ONLY the provided text. Do not assume, infer, or add external knowledge.
- If information is not explicitly stated, do NOT include it.
- Be precise and avoid duplication.
- Every item must be directly supported by the text.

DEFINITIONS:
- REQUIREMENTS: obligations using words like "must", "shall", "required"
- EVALUATION CRITERIA: how the government will judge proposals or awards
- RISKS: constraints, challenges, or difficult conditions mentioned in the text

PRIORITY RULES:
- "must", "shall", "required" → high
- "should", "preferred" → medium
- optional / implied → low

Return ONLY valid JSON. Do not include any text outside the JSON.`;

const JSON_SCHEMA = {
  requirements: [
    {
      text: 'string',
      priority: '"high" | "medium" | "low"'
    }
  ],
  evaluationCriteria: [
    {
      text: 'string',
      weight: '"high" | "medium" | "low"'
    }
  ],
  risks: [
    {
      text: 'string',
      severity: '"high" | "medium" | "low"'
    }
  ]
};

const validate = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Parsed data is not an object');
  }

  if (!Array.isArray(data.requirements)) {
    throw new Error('requirements must be an array');
  }

  if (!Array.isArray(data.evaluationCriteria)) {
    throw new Error('evaluationCriteria must be an array');
  }

  if (!Array.isArray(data.risks)) {
    throw new Error('risks must be an array');
  }

  data.requirements.forEach((req, idx) => {
    if (!req.text || typeof req.text !== 'string') {
      throw new Error(`requirements[${idx}].text must be a non-empty string`);
    }
    if (!['high', 'medium', 'low'].includes(req.priority)) {
      throw new Error(`requirements[${idx}].priority must be "high", "medium", or "low"`);
    }
  });

  data.evaluationCriteria.forEach((crit, idx) => {
    if (!crit.text || typeof crit.text !== 'string') {
      throw new Error(`evaluationCriteria[${idx}].text must be a non-empty string`);
    }
    if (!['high', 'medium', 'low'].includes(crit.weight)) {
      throw new Error(`evaluationCriteria[${idx}].weight must be "high", "medium", or "low"`);
    }
  });

  data.risks.forEach((risk, idx) => {
    if (!risk.text || typeof risk.text !== 'string') {
      throw new Error(`risks[${idx}].text must be a non-empty string`);
    }
    if (!['high', 'medium', 'low'].includes(risk.severity)) {
      throw new Error(`risks[${idx}].severity must be "high", "medium", or "low"`);
    }
  });

  return true;
};

const parseRFP = async (rfpText, retry = 0) => {
  const prompt = `Extract structured information from this RFP text. Return ONLY valid JSON in this exact format:
${JSON.stringify(JSON_SCHEMA)}

RFP TEXT:
${rfpText}`;

  try {
    const response = await callLLM({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      json: true,
      maxTokens: 1000
    });

    validate(response);
    return response;
  } catch (error) {
    if (retry < 1) {
      console.warn('Parser error, retrying...', error.message);
      return parseRFP(rfpText, retry + 1);
    }
    throw new Error(`RFP parsing failed after retry: ${error.message}`);
  }
};

const analyze = async (rfpText) => {
  if (!rfpText || typeof rfpText !== 'string' || rfpText.trim().length === 0) {
    throw new Error('RFP text is required and must be non-empty');
  }

  return parseRFP(rfpText.trim());
};

module.exports = { analyze };
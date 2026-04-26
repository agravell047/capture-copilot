const fs = require('fs');
const path = require('path');
const { callLLM } = require('../llm/client');

const teamDataPath = path.join(__dirname, '../data/teamData.json');

const SYSTEM_PROMPT = `You are a federal proposal team lead recommending team members for an RFP.

Your task:
- Analyze RFP requirements and team member skills
- Match the best-fit team members for the opportunity
- Identify critical skill gaps not covered

Return ONLY valid JSON. Do not include any text outside the JSON.`;

const recommendTeam = async (rfpData) => {
  if (!rfpData || typeof rfpData !== 'object') {
    throw new Error('RFP data is required and must be an object');
  }

  const teamData = JSON.parse(fs.readFileSync(teamDataPath, 'utf8'));

  if (!Array.isArray(teamData) || teamData.length === 0) {
    throw new Error('Team data is empty or invalid');
  }

  const prompt = `Based on the RFP data and team members, recommend a team and identify gaps.

RFP Requirements:
${JSON.stringify(rfpData.requirements || [], null, 2)}

Evaluation Criteria:
${JSON.stringify(rfpData.evaluationCriteria || [], null, 2)}

Team Members Available:
${JSON.stringify(teamData, null, 2)}

Return ONLY valid JSON in this exact format:
{
  "recommendedTeam": [
    {
      "id": number,
      "name": "string",
      "skills": ["string"],
      "experience": number,
      "rationale": "string"
    }
  ],
  "missingRoles": [
    {
      "role": "string",
      "reason": "string",
      "criticality": "high" | "medium" | "low"
    }
  ]
}`;

  try {
    const response = await callLLM({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      json: true,
      maxTokens: 1200
    });

    validateTeamRecommendation(response);
    return response;
  } catch (error) {
    throw new Error(`Team recommendation failed: ${error.message}`);
  }
};

const validateTeamRecommendation = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Response is not an object');
  }

  if (!Array.isArray(data.recommendedTeam)) {
    throw new Error('recommendedTeam must be an array');
  }

  if (!Array.isArray(data.missingRoles)) {
    throw new Error('missingRoles must be an array');
  }

  data.recommendedTeam.forEach((member, idx) => {
    if (!Number.isInteger(member.id)) {
      throw new Error(`recommendedTeam[${idx}].id must be an integer`);
    }
    if (!member.name || typeof member.name !== 'string') {
      throw new Error(`recommendedTeam[${idx}].name must be a non-empty string`);
    }
    if (!Array.isArray(member.skills)) {
      throw new Error(`recommendedTeam[${idx}].skills must be an array`);
    }
    if (!Number.isInteger(member.experience)) {
      throw new Error(`recommendedTeam[${idx}].experience must be an integer`);
    }
    if (!member.rationale || typeof member.rationale !== 'string') {
      throw new Error(`recommendedTeam[${idx}].rationale must be a non-empty string`);
    }
  });

  data.missingRoles.forEach((gap, idx) => {
    if (!gap.role || typeof gap.role !== 'string') {
      throw new Error(`missingRoles[${idx}].role must be a non-empty string`);
    }
    if (!gap.reason || typeof gap.reason !== 'string') {
      throw new Error(`missingRoles[${idx}].reason must be a non-empty string`);
    }
    if (!['high', 'medium', 'low'].includes(gap.criticality)) {
      throw new Error(`missingRoles[${idx}].criticality must be "high", "medium", or "low"`);
    }
  });

  return true;
};

const recommend = async (rfpData) => {
  return recommendTeam(rfpData);
};

module.exports = { recommend, recommendTeam };
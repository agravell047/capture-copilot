const axios = require('axios');
const settingsService = require('../services/settings');

const MOCK_RESPONSES = {
  'opportunity-analysis': {
    recommendation: 'GO',
    pWin: 65,
    fitSummary: 'Good fit on vehicle and scope, existing relationships provide advantage, but timeline is tight.',
    fitDetails: [
      'IDIQ vehicle and SDVOSB set-aside align with company posture and reduces entry friction',
      'Known access signals suggest early traction (program lead touch + incumbent-adjacent teammate)',
      'FedRAMP/ATO expectations are achievable but need a clear compliance plan or partner support'
    ],
    recommendationRationale: 'Proceed as prime if you can confirm buyer priorities and lock a compliance plan quickly. Timeline is workable, but only with early capture discipline and targeted teaming for any gaps.',
    pWinRationale: 'Moderate pWin driven by vehicle fit and access signals, reduced by compliance and incumbent competition.',
    gaps: [
      'FedRAMP certification - we need to acquire or partner',
      'Specific domain expertise in combat systems integration',
      'Proven experience with this specific agency contract office'
    ],
    strengths: [
      'Existing relationships with DIA contracting office',
      'IDIQ vehicle provides flexibility',
      'Strong cloud infrastructure experience',
      'Key personnel have worked with agency before'
    ],
    risks: [
      'Tight 45-day proposal timeline could impact quality',
      'Incumbent (TechCorp) has significant relationship advantages',
      'Large contract value ($50-200M) likely attracts strong competitors',
      'May need to subcontract cybersecurity components'
    ],
    nextSteps: [
      'Confirm the contracting office and buying activity (office + set-aside posture) and validate vehicle usage',
      'Schedule a technical discovery with the program office to validate integration and ATO expectations',
      'Draft a lightweight win strategy: discriminator list + proof points + likely evaluation hooks',
      'Identify and pre-qualify a FedRAMP/ATO partner if required'
    ]
  },
  'analyze-rfp': {
    requirements: [
      { text: 'System must provide real-time data processing capabilities', priority: 'high' },
      { text: 'System shall support 99.9% uptime SLA', priority: 'high' },
      { text: 'System should integrate with existing federal databases', priority: 'medium' },
      { text: 'System may include advanced analytics features', priority: 'low' }
    ],
    evaluationCriteria: [
      { text: 'Technical approach and architecture design', weight: 'high' },
      { text: 'Cost-effectiveness and pricing model', weight: 'high' },
      { text: 'Company experience with federal projects', weight: 'medium' },
      { text: 'Quality assurance and testing procedures', weight: 'medium' }
    ],
    risks: [
      { text: 'Tight timeline for implementation may impact quality', severity: 'high' },
      { text: 'Compatibility with legacy federal systems', severity: 'medium' },
      { text: 'Cybersecurity compliance requirements are stringent', severity: 'high' },
      { text: 'Resource availability during peak hiring periods', severity: 'low' }
    ]
  },
  'team-recommendation': {
    recommendedTeam: [
      {
        id: 1,
        name: 'Alice Johnson',
        skills: ['project management', 'federal contracting', 'proposal writing', 'leadership'],
        experience: 10,
        rationale: 'Extensive federal contracting experience and proven proposal writing skills'
      },
      {
        id: 2,
        name: 'Bob Smith',
        skills: ['technical writing', 'compliance', 'risk assessment', 'systems design'],
        experience: 8,
        rationale: 'Strong compliance background critical for federal requirements'
      }
    ],
    missingRoles: [
      {
        role: 'Cybersecurity Lead',
        reason: 'Federal projects require dedicated security expertise',
        criticality: 'high'
      },
      {
        role: 'Government Relations Specialist',
        reason: 'Beneficial for stakeholder management and compliance',
        criticality: 'medium'
      }
    ]
  }
};

const getMockResponse = (prompt) => {
  if (prompt.includes('Evaluate this federal opportunity')) {
    return MOCK_RESPONSES['opportunity-analysis'];
  }
  if (prompt.includes('RFP') || prompt.includes('Extract structured')) {
    return MOCK_RESPONSES['analyze-rfp'];
  }
  if (prompt.includes('team') || prompt.includes('recommend')) {
    return MOCK_RESPONSES['team-recommendation'];
  }
  return MOCK_RESPONSES['opportunity-analysis'];
};

const isPlausibleOpenAiKey = (apiKey) => {
  if (!apiKey) return false;
  const trimmed = String(apiKey).trim();
  if (!trimmed) return false;
  if (trimmed.includes('your_')) return false;
  // Covers modern keys like sk-... and sk-proj-...
  return trimmed.startsWith('sk-');
};

const callLLM = async ({ messages, json = false, model = '', maxTokens = 500 }) => {
  const envKey = process.env.OPENAI_API_KEY;
  const envModel = process.env.OPENAI_MODEL;
  const settings = await settingsService.getSettings();
  const apiKey = isPlausibleOpenAiKey(envKey) ? String(envKey).trim() : String(settings.openaiApiKey || '').trim();
  const resolvedModel = String(model || envModel || settings.model || 'gpt-3.5-turbo').trim();
  const resolvedBaseUrl = String(process.env.OPENAI_BASE_URL || settings.baseUrl || 'https://api.openai.com').trim().replace(/\/+$/, '');
  const useApi = isPlausibleOpenAiKey(apiKey);

  try {
    let content;

    if (useApi) {
      // Call OpenAI API (Chat Completions; keep simple for this POC)
      const response = await axios.post(`${resolvedBaseUrl}/v1/chat/completions`, {
        model: resolvedModel,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      content = response.data.choices[0].message.content.trim();
      console.log('[LLM Client] Using OpenAI API');
    } else {
      // Use mock response
      console.log('[LLM Client] Using mock response (no API key configured)');
      const userMessage = messages[messages.length - 1]?.content || '';
      const mockData = getMockResponse(userMessage);
      content = JSON.stringify(mockData);
    }

    if (json) {
      try {
        content = JSON.parse(content);
      } catch (parseError) {
        throw new Error('LLM response is not valid JSON');
      }
    }

    return content;
  } catch (error) {
    if (error.response) {
      throw new Error(`OpenAI API error: ${error.response.status} - ${error.response.data?.error?.message || error.message}`);
    } else if (error.request) {
      throw new Error('OpenAI API request failed: No response received');
    } else if (error.message.includes('ENOTFOUND')) {
      throw new Error('Network error: Cannot reach OpenAI API');
    } else {
      throw new Error(`LLM client error: ${error.message}`);
    }
  }
};

module.exports = { callLLM };

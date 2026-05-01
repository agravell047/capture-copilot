const OpenAI = require('openai');
const settingsService = require('../services/settings');

const MOCK_RESPONSES = {
  'opportunity-analysis': {
    recommendation: 'GO',
    pWin: 52,
    fitSummary: "Strong vehicle and set-aside fit — OASIS+ is pre-qualified and SDVOSB set-aside reduces the competitive field. Core COBOL modernization scope maps directly to Apex's declared capabilities, with CMS and VA analog past performance as the credibility bridge. The key qualification question is whether SSA will accept comparable benefits-platform references in lieu of direct SSA history.",
    fitDetails: [
      'OASIS+ vehicle is pre-qualified — Apex is registered and in good standing, eliminating vehicle access risk at Gate 1.',
      'SDVOSB set-aside confirmed via Sources Sought — significantly narrows the competitive field to SDVOSB-eligible primes only.',
      'COBOL-to-microservices modernization with AWS GovCloud migration is a declared core capability with direct delivery history.',
      'CMS Medicaid Enterprise Systems engagement is the strongest past performance analog — benefits adjudication at scale with FedRAMP and Section 508 requirements is functionally comparable.',
      'FedRAMP Moderate and DevSecOps are named PWS requirements that match Apex core delivery capabilities exactly.',
      'No direct SSA past performance — the 30%-weighted past performance criterion is the primary proposal risk at this stage.'
    ],
    recommendationRationale: 'Qualify and pursue as SDVOSB prime. Vehicle fit, set-aside alignment, and scope match are all strong enough to justify Gate 1 investment. The gaps — SSA past performance and buyer relationship — are real but addressable before a September RFP drop with the right teaming strategy. Do not commit full capture resources yet: complete the qualification actions below first, particularly identifying a teaming partner with active SSA task order experience.',
    pWinRationale: 'Conservative Gate 1 estimate reflecting strong structural fit (vehicle, set-aside, scope) against the two primary drag factors: absence of SSA-specific past performance weighted at 30% and no established buyer relationship. pWin is upgradable to 65-70% if teaming brings SSA incumbent access and stakeholder introductions are secured before RFP drop.',
    nextSteps: [
      "Request an industry engagement meeting with SSA OIT — use Marcus Webb's Industry Day contact (Deputy CIO) as the entry point. Target before May 15.",
      'Identify 1-2 teaming partner candidates with active SSA task orders. Prioritize firms with SSA COBOL or mainframe modernization experience.',
      'Pull all active SSA IDIQ vehicles and award data on SAM.gov to map the competitive landscape before committing further resources.',
      "Have Priya Nair draft a one-page technical brief on Apex's COBOL-to-cloud methodology addressing the 24/7 continuity-of-operations constraint — this will be the leave-behind for the SSA OIT meeting.",
      'Go/No-Go checkpoint: reconvene in 3 weeks to assess whether a credible teaming path and buyer engagement are achievable before RFP drop.'
    ],
    strengths: [
      'OASIS+ vehicle pre-qualified — no access risk',
      'SDVOSB set-aside confirmed, reducing the competitive field',
      'COBOL modernization and AWS GovCloud migration are declared core capabilities',
      'CMS and VA analog past performance are high-credibility comparables for a benefits agency',
      'FedRAMP Moderate and DevSecOps requirements match Apex core delivery exactly'
    ],
    gaps: [
      { area: 'SSA Past Performance', detail: 'No direct SSA delivery history. Past performance is weighted at 30% and evaluators will compare references directly against the SSA benefits and disability claims context.', severity: 'high', mitigation: 'Identify a teaming partner with an active or recent SSA task order. Position CMS Medicaid Enterprise work as the primary analog — document the functional parallels between Medicaid adjudication and disability claims processing explicitly.' },
      { area: 'Buyer Relationship', detail: 'No established relationship with the SSA program office, contracting officer, or technical authority beyond a brief Industry Day encounter.', severity: 'high', mitigation: "Request a one-on-one industry engagement meeting with SSA OIT leadership. Use Marcus Webb's Industry Day contact (Deputy CIO) as the warm introduction path." },
      { area: 'Competitive Landscape', detail: 'SSA modernization historically attracts large prime contractors. Incumbent presence and large-prime teaming posture are not yet mapped.', severity: 'medium', mitigation: 'Pull active SSA IDIQ vehicle award data on SAM.gov. Confirm whether the SDVOSB set-aside effectively limits the field before committing full capture investment.' }
    ],
    risks: [
      'No SSA past performance reference — 30% evaluation weight makes this the single largest proposal risk.',
      'Buyer relationship is nascent — no established trust with the program office or contracting officer.',
      'Legacy COBOL scope may attract large established contractors with existing SSA mainframe access.',
      'Continuity-of-operations requirement (24/7 claims processing) adds delivery complexity and proposal narrative risk.',
      'September RFP timeline leaves ~5 months for capture — adequate but requires immediate relationship-building to be effective.'
    ],
    proposedTeam: [
      { memberId: 'tm-002', proposedRole: 'Capture Lead', rationale: 'James Okafor owns the capture strategy and pipeline — the right person to manage this pursuit from qualification through proposal.' },
      { memberId: 'tm-003', proposedRole: 'Technical Volume Lead', rationale: "Priya Nair's cloud architecture and FedRAMP expertise are central to the technical approach narrative for SSA's GovCloud migration." },
      { memberId: 'tm-004', proposedRole: 'Program Manager', rationale: "Marcus Webb has the existing Industry Day contact at SSA OIT and the federal CPARS reporting background needed to lead program delivery." },
      { memberId: 'tm-005', proposedRole: 'Proposal Manager', rationale: 'Sofia Reyes owns the compliance matrix and color review process — essential for a Best Value Tradeoff evaluation with four weighted criteria.' },
      { memberId: 'tm-022', proposedRole: 'Key Personnel — Legacy Migration Lead', rationale: "Patrick O'Brien's COBOL modernization and Java migration background directly addresses the 30-year mainframe-to-microservices core requirement." },
      { memberId: 'tm-008', proposedRole: 'Key Personnel — DevSecOps Lead', rationale: "Alicia Fontaine's ATO pipeline automation and SAST/DAST credentials are directly responsive to the FedRAMP Moderate and DevSecOps PWS requirements." }
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

const callLLM = async ({ messages, json = false, model = '' }) => {
  const envKey = process.env.OPENAI_API_KEY;
  const envModel = process.env.OPENAI_MODEL;
  const settings = await settingsService.getSettings();
  const apiKey = isPlausibleOpenAiKey(envKey) ? String(envKey).trim() : String(settings.openaiApiKey || '').trim();
  const resolvedModel = String(model || envModel || settings.model || 'gpt-4o-mini').trim();
  const resolvedBaseUrl = String(process.env.OPENAI_BASE_URL || settings.baseUrl || 'https://api.openai.com').trim().replace(/\/+$/, '');
  const useApi = isPlausibleOpenAiKey(apiKey);

  try {
    let content;

    if (useApi) {
      // Use official OpenAI SDK — Responses API (recommended per docs)
      const clientOptions = { apiKey };
      if (resolvedBaseUrl !== 'https://api.openai.com') {
        clientOptions.baseURL = `${resolvedBaseUrl}/v1`;
      }
      const openai = new OpenAI(clientOptions);

      // Map system → developer role (Responses API convention)
      const input = messages.map(m => ({
        role: m.role === 'system' ? 'developer' : m.role,
        content: m.content
      }));

      const response = await openai.responses.create({
        model: resolvedModel,
        input,
        temperature: 0.7
      });

      content = response.output_text.trim();
      console.log('[LLM Client] Using OpenAI Responses API');
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
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API error: ${error.status} - ${error.message}`);
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('ECONNREFUSED')) {
      throw new Error('Network error: Cannot reach OpenAI API');
    } else {
      throw new Error(`LLM client error: ${error.message}`);
    }
  }
};

module.exports = { callLLM };

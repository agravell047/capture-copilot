const { callLLM } = require('../llm/client');
const companyContextService = require('./companyContext');

const SYSTEM_PROMPT = `You are a federal capture strategist evaluating whether a company should pursue a federal opportunity.

Your role is to assess ONLY:
1. VEHICLE: Does the company have access?
2. SET-ASIDE: Is it compatible with company designation?
3. CONTRACT VALUE: Impact on prime vs subcontractor likelihood
4. SCOPE ALIGNMENT: Does description match company capabilities?
5. RELATIONSHIPS: Any known stakeholders or advantages?
6. EVALUATION: How are they scoring the winner (orals, case study, etc.) and what does that imply?
7. TIMELINE: Impact on feasibility and pWin
8. EVIDENCE: Use provided evidence notes/summaries when available
9. EVOLVING CONTEXT: Do later updates improve or weaken the pursuit case?

IMPORTANT RULES:
- pWin must be 0-100, realistic and conservative
- Recommendation: GO (pursue as prime), SUBCONTRACT (pursue as sub), or NO_GO
- Avoid generic statements and be specific about gaps, strengths, and risks
- Base ALL reasoning ONLY on provided data
- Treat updates as higher-priority context than stale assumptions in the original opportunity when they conflict
- Explicitly incorporate meaningful updates into the reasoning behind pWin, strengths, gaps, and risks
- Keep the output format exactly the same even when updates are present
- Return ONLY valid JSON with NO additional text`;

const toCompactString = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value).slice(0, 240);
    } catch {
      return '';
    }
  }
  return '';
};

const buildOpportunityContext = (formData = {}) => ({
  opportunityName: formData.opportunityName || formData.name,
  agency: formData.agency,
  contractValue: formData.contractValue || '<5M',
  vehicle: formData.vehicle || 'Not specified',
  setAside: formData.setAside || 'None',
  gate: formData.gate ?? 0,
  evaluation: formData.evaluation || { type: '', criteria: [], notes: '' },
  stakeholders: Array.isArray(formData.stakeholders) ? formData.stakeholders.slice(0, 12) : [],
  evidence: Array.isArray(formData.evidence) ? formData.evidence.slice(0, 8) : [],
  timeline: formData.timeline || 'Not specified',
  description: formData.description || '',
  rfpSummary: formData.rfp && formData.rfp.summary ? formData.rfp.summary : null,
  knownRelationships: formData.knownRelationships || 'None',
  internalNotes: formData.notes || 'None'
});

const buildPromptPayload = ({ opportunity, company, updates }) => ({
  opportunity,
  company,
  updates
});

const analyzeOpportunity = async (formData, options = {}) => {
  if (!formData || typeof formData !== 'object') {
    throw new Error('Opportunity data is required and must be an object');
  }

  const opportunityName = formData.opportunityName || formData.name;
  const { agency, description } = formData;
  const hasRfpSummary = Boolean(
    formData.rfp &&
    formData.rfp.summary &&
    typeof formData.rfp.summary === 'object' &&
    (
      String(formData.rfp.summary.overview || '').trim().length > 0 ||
      (Array.isArray(formData.rfp.summary.requirements) && formData.rfp.summary.requirements.length > 0) ||
      (Array.isArray(formData.rfp.summary.scope) && formData.rfp.summary.scope.length > 0)
    )
  );

  const gate = Number.isFinite(Number(formData.gate)) ? Number(formData.gate) : 0;
  const allowSparseAtGate0 = gate <= 0;

  if (!opportunityName || !agency || (!allowSparseAtGate0 && !description && !hasRfpSummary)) {
    throw new Error('Opportunity name, agency, and description (or RFP summary) are required');
  }

  const opportunityUpdates = Array.isArray(formData.updates) ? formData.updates : [];
  const includeUpdates = options.includeUpdates !== undefined
    ? Boolean(options.includeUpdates)
    : opportunityUpdates.length > 0;

  let companyContext = {};
  try {
    companyContext = await companyContextService.getCompanyContext();
  } catch (error) {
    console.warn('[Opportunity Analysis] Could not load company context:', error.message);
  }

  // Keep prompt bounded even if the company profile is very large.
  if (companyContext && typeof companyContext === 'object') {
    if (Array.isArray(companyContext.teamMembers)) {
      companyContext = {
        ...companyContext,
        teamMembers: companyContext.teamMembers.slice(0, 20).map((member) => ({
          name: member.name,
          role: member.role,
          experienceYears: member.experienceYears,
          skills: Array.isArray(member.skills) ? member.skills.slice(0, 8) : []
        }))
      };
    }
  }

  const opportunityJson = buildOpportunityContext(formData);
  const updatesForPrompt = includeUpdates ? opportunityUpdates : [];
  const promptPayload = buildPromptPayload({
    opportunity: opportunityJson,
    company: companyContext,
    updates: updatesForPrompt
  });

  const prompt = `Evaluate this federal opportunity:

${JSON.stringify(promptPayload, null, 2)}

Provide a go/no-go recommendation with pWin score and analysis. Consider company context when assessing fit, capabilities, feasibility, and evolving context over time.
If an rfpSummary is present, use it as the primary source of truth for scope/requirements (do not depend on raw RFP text).

Return ONLY valid JSON. Always include ALL keys below. Keep content rich but compact.

REQUIRED JSON format (always return this exact shape):
{
  "recommendation": "GO" | "SUBCONTRACT" | "NO_GO",
  "pWin": number between 0 and 100,
  "fitSummary": "string - one sentence on overall fit (used as the headline)",
  "fitDetails": ["2-5 short bullets explaining why (specific)"],
  "recommendationRationale": "2-4 sentences explaining the recommendation (not just the same as fitSummary)",
  "nextSteps": ["3-6 specific next steps tailored to this opportunity"],
  "pWinRationale": "1-2 sentences explaining drivers of pWin",
  "gaps": [{"area":"string","detail":"string","severity":"high|medium|low","mitigation":"string"}],
  "strengths": ["strength1", "strength2"],
  "risks": ["risk1", "risk2"]
}`;

  try {
    const response = await callLLM({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      json: true,
      maxTokens: 800
    });

    console.log('[Opportunity Analysis] LLM Response:', JSON.stringify(response));

    validateAnalysisResponse(response);

    const fallbackFitDetails = () => {
      const bullets = [];

      if (formData.vehicle) bullets.push(`Vehicle fit: ${formData.vehicle} is in play and reduces entry friction.`);
      if (formData.setAside && formData.setAside !== 'None') bullets.push(`Set-aside alignment: ${formData.setAside} supports pursuing with the current posture.`);
      if (formData.knownRelationships) bullets.push('Access signals are present; convert them into a concrete stakeholder map and touch plan.');
      if (companyContext.capabilities && companyContext.capabilities.length > 0) bullets.push(`Capabilities to lean on: ${companyContext.capabilities.slice(0, 3).join(', ')}.`);
      if (formData.timeline) bullets.push('Timeline feasibility depends on early capture discipline and fast compliance planning.');

      return bullets.slice(0, 5);
    };

    const fallbackPwinRationale = () => {
      const parts = [];
      if (formData.vehicle) parts.push('vehicle fit');
      if (formData.setAside && formData.setAside !== 'None') parts.push('set-aside alignment');
      if (formData.knownRelationships) parts.push('access signals');
      const negatives = [];
      if (formData.timeline && String(formData.timeline).toLowerCase().includes('30')) negatives.push('tight timeline');
      if (companyContext.knownGaps && companyContext.knownGaps.length > 0) negatives.push('known company gaps');

      const positivesText = parts.length > 0 ? parts.join(', ') : 'baseline fit';
      const negativesText = negatives.length > 0 ? `; reduced by ${negatives.join(', ')}` : '';
      return `pWin is driven by ${positivesText}${negativesText}.`;
    };

    const fallbackRecommendationRationale = () => {
      return `Recommendation is based on vehicle/set-aside fit, scope alignment to capabilities, and current access signals. Validate buyer priorities early and close any compliance/teaming gaps quickly to protect pWin.`;
    };

    const normalizeBullets = (value, min = 2, max = 6, fallbackFn) => {
      const bullets = Array.isArray(value)
        ? value.map((item) => toCompactString(item)).filter(Boolean)
        : [];
      if (bullets.length >= min) return bullets.slice(0, max);
      const fallback = typeof fallbackFn === 'function' ? fallbackFn() : [];
      const merged = [...bullets, ...fallback].map((b) => toCompactString(b)).filter(Boolean);
      return merged.slice(0, Math.max(min, Math.min(max, merged.length)));
    };

    const fitDetails = normalizeBullets(response.fitDetails, 2, 6, fallbackFitDetails);
    const nextSteps = normalizeBullets(response.nextSteps, 3, 6, () => generateNextSteps(response.recommendation));
    const pWinRationale = toCompactString(response.pWinRationale) || fallbackPwinRationale();
    const recommendationRationale = toCompactString(response.recommendationRationale) || fallbackRecommendationRationale();

    return {
      opportunityName,
      name: opportunityName,
      agency: formData.agency,
      contractValue: formData.contractValue || '<5M',
      vehicle: formData.vehicle || 'Not specified',
      setAside: formData.setAside || 'None',
      fitAssessment: {
        rating: response.recommendation === 'GO' ? 'Good' : response.recommendation === 'SUBCONTRACT' ? 'Medium' : 'Poor',
        rationale: response.fitSummary,
        details: fitDetails,
        strengths: Array.isArray(response.strengths) ? response.strengths.map((item) => normalizeListItemText(item)).filter(Boolean) : []
      },
      pWinScore: {
        score: response.pWin,
        tier: response.pWin >= 70 ? 'high' : response.pWin >= 40 ? 'medium' : 'low',
        reasoning: includeUpdates && updatesForPrompt.length > 0
          ? `Based on original opportunity data and ${updatesForPrompt.length} context update(s)`
          : pWinRationale
      },
      gaps: normalizeGapItems(response.gaps || []),
      feasibilityFactors: buildFeasibilityFactors(formData),
      risks: normalizeRiskItems(response.risks || []),
      recommendation: {
        action: response.recommendation === 'GO' ? 'Go' : response.recommendation === 'SUBCONTRACT' ? 'Conditional' : 'Pass',
        rationale: recommendationRationale,
        nextSteps
      }
    };
  } catch (error) {
    console.error('[Opportunity Analysis] Error:', error);
    throw new Error(`Opportunity analysis failed: ${error.message}`);
  }
};

const buildFeasibilityFactors = (formData = {}) => ({
  'Vehicle Fit': formData.vehicle ? 'Strong' : 'Weak',
  'Set-Aside Alignment': formData.setAside && formData.setAside !== 'None' ? 'Strong' : 'Moderate',
  'Relationship Coverage': formData.knownRelationships ? 'Strong' : 'Weak',
  'Timeline Feasibility': formData.timeline && !formData.timeline.toLowerCase().includes('urgent')
    ? 'Favorable'
    : 'Challenging',
  'Scope Alignment': (
    (formData.description && formData.description.length > 100) ||
    (formData.rfp && formData.rfp.summary && Array.isArray(formData.rfp.summary.requirements) && formData.rfp.summary.requirements.length > 0)
  ) ? 'Strong' : 'Moderate'
});

const validateAnalysisResponse = (data) => {
  if (!data) {
    throw new Error('LLM response is empty or null');
  }

  if (typeof data !== 'object') {
    throw new Error(`Response must be an object, got ${typeof data}`);
  }

  if (!data.recommendation) {
    throw new Error('recommendation is required');
  }
  if (!['GO', 'SUBCONTRACT', 'NO_GO'].includes(data.recommendation)) {
    throw new Error(`recommendation must be "GO", "SUBCONTRACT", or "NO_GO", got "${data.recommendation}"`);
  }

  if (data.pWin === undefined || data.pWin === null) {
    throw new Error('pWin is required');
  }
  if (!Number.isInteger(data.pWin)) {
    throw new Error(`pWin must be an integer, got ${typeof data.pWin}: ${data.pWin}`);
  }
  if (data.pWin < 0 || data.pWin > 100) {
    throw new Error(`pWin must be between 0 and 100, got ${data.pWin}`);
  }

  if (!data.fitSummary) {
    throw new Error('fitSummary is required');
  }
  if (typeof data.fitSummary !== 'string') {
    throw new Error(`fitSummary must be a string, got ${typeof data.fitSummary}`);
  }

  if (!Array.isArray(data.gaps)) {
    throw new Error(`gaps must be an array, got ${typeof data.gaps}`);
  }
  if (!Array.isArray(data.fitDetails)) {
    throw new Error(`fitDetails must be an array, got ${typeof data.fitDetails}`);
  }
  if (!data.recommendationRationale || typeof data.recommendationRationale !== 'string') {
    throw new Error('recommendationRationale must be a string');
  }
  if (!data.pWinRationale || typeof data.pWinRationale !== 'string') {
    throw new Error('pWinRationale must be a string');
  }
  if (!Array.isArray(data.nextSteps)) {
    throw new Error(`nextSteps must be an array, got ${typeof data.nextSteps}`);
  }
  if (!Array.isArray(data.strengths)) {
    throw new Error(`strengths must be an array, got ${typeof data.strengths}`);
  }
  if (!Array.isArray(data.risks)) {
    throw new Error(`risks must be an array, got ${typeof data.risks}`);
  }

  return true;
};

const extractGapArea = (gap) => {
  if (gap.toLowerCase().includes('vehicle')) return 'Vehicle Access';
  if (gap.toLowerCase().includes('relationship')) return 'Relationships';
  if (gap.toLowerCase().includes('capability')) return 'Capability';
  if (gap.toLowerCase().includes('compliance')) return 'Compliance';
  if (gap.toLowerCase().includes('timeline')) return 'Timeline';
  return 'Operational Gap';
};

const inferSeverity = (gap) => {
  if (gap.toLowerCase().includes('critical') || gap.toLowerCase().includes('must have')) return 'high';
  if (gap.toLowerCase().includes('should') || gap.toLowerCase().includes('important')) return 'medium';
  return 'low';
};

const normalizeListItemText = (item) => {
  if (item === null || item === undefined) return '';
  if (typeof item === 'string') return item.trim();
  if (typeof item === 'number' || typeof item === 'boolean') return String(item);
  if (typeof item === 'object') {
    const candidates = ['detail', 'text', 'value', 'name', 'title', 'summary'];
    for (const key of candidates) {
      if (typeof item[key] === 'string' && item[key].trim()) return item[key].trim();
    }
    try {
      return JSON.stringify(item).slice(0, 240);
    } catch {
      return '';
    }
  }
  return '';
};

const normalizeGapItems = (gaps = []) => {
  if (!Array.isArray(gaps)) return [];

  // If model returned detailed objects, prefer them.
  if (gaps.length > 0 && typeof gaps[0] === 'object' && gaps[0] !== null && !Array.isArray(gaps[0])) {
    return gaps
      .map((gap) => ({
        area: String(gap.area || '').trim() || 'Operational Gap',
        detail: normalizeListItemText(gap.detail || gap.text || gap.value),
        severity: ['high', 'medium', 'low'].includes(String(gap.severity || '').toLowerCase())
          ? String(gap.severity).toLowerCase()
          : inferSeverity(normalizeListItemText(gap.detail || '')),
        mitigation: normalizeListItemText(gap.mitigation || '')
      }))
      .filter((gap) => Boolean(gap.detail));
  }

  // Otherwise assume list of strings.
  return gaps
    .map((gap) => normalizeListItemText(gap))
    .filter(Boolean)
    .map((gap) => ({
      area: extractGapArea(gap),
      detail: gap,
      severity: inferSeverity(gap),
      mitigation: ''
    }));
};

const normalizeRiskItems = (risks = []) => {
  if (!Array.isArray(risks)) return [];

  if (risks.length > 0 && typeof risks[0] === 'object' && risks[0] !== null && !Array.isArray(risks[0])) {
    return risks
      .map((risk) => ({
        detail: normalizeListItemText(risk.detail || risk.text || risk.value),
        severity: ['high', 'medium', 'low'].includes(String(risk.severity || '').toLowerCase())
          ? String(risk.severity).toLowerCase()
          : 'medium',
        mitigation: normalizeListItemText(risk.mitigation || '')
      }))
      .filter((risk) => Boolean(risk.detail));
  }

  return risks.map((risk) => normalizeListItemText(risk)).filter(Boolean);
};

const generateNextSteps = (recommendation) => {
  if (recommendation === 'GO') {
    return [
      'Assign capture manager',
      'Develop win strategy',
      'Identify teaming partners if needed',
      'Create compliance matrix'
    ];
  }

  if (recommendation === 'SUBCONTRACT') {
    return [
      'Identify prime contractors',
      'Develop subcontractor strategy',
      'Build capabilities roadmap',
      'Plan for future prime opportunities'
    ];
  }

  return [
    'Document decision rationale',
    'Identify future opportunities',
    'Build missing capabilities',
    'Revisit after capability development'
  ];
};

module.exports = { analyzeOpportunity };

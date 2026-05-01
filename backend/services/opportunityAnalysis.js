const fs = require('fs');
const path = require('path');
const { callLLM } = require('../llm/client');
const companyContextService = require('./companyContext');
const settingsService = require('./settings');
const pastPerformanceService = require('./pastPerformance');

const TEAM_DATA_PATH = path.join(__dirname, '../data/teamData.json');

// Load team keyed by ID for post-AI mapping (name/email never sent to AI)
const loadTeamById = () => {
  try {
    const raw = JSON.parse(fs.readFileSync(TEAM_DATA_PATH, 'utf8'));
    return Object.fromEntries(raw.map((m) => [m.id, m]));
  } catch {
    return {};
  }
};

const GATE_CONTEXT = {
  0: {
    stage: 'Gate 0 — Awareness',
    focus: `This opportunity is in early awareness. The company just learned about it.
PRIORITY QUESTIONS at this stage:
- Is this worth tracking at all? Quick fit check only.
- Does the agency, vehicle, and rough scope match the company's wheelhouse?
- Is there any existing relationship or past work with this agency?
- Is the set-aside compatible?
DO NOT over-analyze. Keep recommendation and pWin appropriately tentative — data is sparse.
nextSteps should be intelligence-gathering actions (research the agency, identify contacts, check vehicle eligibility).`,
  },
  1: {
    stage: 'Gate 1 — Qualify',
    focus: `This opportunity is being qualified. The company is deciding whether to invest real capture resources.
PRIORITY QUESTIONS at this stage:
- Do we have a realistic path to win (relationships, past performance, vehicle access)?
- Who is the competition and do we have a differentiated position?
- Is the set-aside and contract value right for prime vs. sub?
- Are there any early shaping opportunities?
pWin should reflect early intelligence — be conservative. Flag where data is missing.
nextSteps should focus on relationship-building, intel-gathering, and go/no-go decision criteria.`,
  },
  2: {
    stage: 'Gate 2 — Capture',
    focus: `This opportunity is in active capture. The company has committed resources and is shaping to win.
PRIORITY QUESTIONS at this stage:
- What is the win strategy and discriminators?
- Who are we teaming with and does the team close all gaps?
- Are we shaping the requirement (briefings, RFI responses, white papers)?
- What does the incumbent look like and how do we beat them?
- How are evaluation criteria likely to be weighted and are we positioned against them?
pWin should reflect capture progress — relationships, teaming, shaping actions completed.
nextSteps should be specific capture actions: meetings booked, white papers, teaming agreements, orals prep.`,
  },
  3: {
    stage: 'Gate 3 — Proposal',
    focus: `This opportunity is at proposal stage. An RFP is out or imminent.
PRIORITY QUESTIONS at this stage:
- Are we fully positioned against every evaluation criterion?
- Is the proposal team stood up and the timeline executable?
- What is the pricing strategy and is it competitive?
- Are key personnel identified and available?
- What are the highest-risk areas in the proposal?
pWin should reflect actual positioning — be specific about what will win or lose this.
nextSteps must be proposal-execution actions with urgency: volume assignments, review schedule, pricing sign-off, orals prep.`,
  },
};

const buildSystemPrompt = (gate) => {
  const gateNum = Number.isFinite(Number(gate)) ? Math.min(Math.max(Number(gate), 0), 3) : 0;
  const ctx = GATE_CONTEXT[gateNum];
  return `You are a federal capture strategist evaluating a federal opportunity at ${ctx.stage}.

${ctx.focus}

ALWAYS ASSESS (regardless of gate):
1. VEHICLE: Does the company have access?
2. SET-ASIDE: Is it compatible with company designation?
3. CONTRACT VALUE: Impact on prime vs subcontractor likelihood
4. SCOPE ALIGNMENT: Does description match company capabilities?
5. RELATIONSHIPS: Any known stakeholders or advantages?
6. EVALUATION: How are they scoring the winner and what does that imply?
7. TIMELINE: Impact on feasibility and pWin
8. EVIDENCE: Use provided evidence notes/summaries when available
9. EVOLVING CONTEXT: Treat updates as higher-priority than stale assumptions
10. PAST PERFORMANCE PATTERNS: If similarPastPursuits is provided, reference specific lessons explicitly. Do not fabricate.
11. TEAM FIT: company.teamMembers is pre-filtered by relevance from a team of company.teamSize. Name specific individuals for key roles.

IMPORTANT RULES:
- pWin must be 0-100, realistic and conservative — reflect the actual stage of capture maturity
- Recommendation: GO (pursue as prime), SUBCONTRACT (pursue as sub), or NO_GO
- Avoid generic statements — be specific to this agency, scope, and company
- Base ALL reasoning ONLY on provided data — do not invent facts, contacts, or past performance
- Be concise: use short sentences and tight prose — do not pad or repeat yourself across fields
- Do not repeat the opportunity name or agency name inside field values — it is already known
- proposedTeam: use ONLY memberId values from the company.teamMembers list provided — do not fabricate IDs or names. Always propose at least 3-5 members covering distinct roles (capture, technical, program management, etc.)
- gaps: if recommendation is NO_GO or pWin is below 50, return at least 3 gaps. Otherwise return only real gaps — do not fabricate gaps to meet a quota. Tie each gap to a specific evaluation criterion when criteria are provided
- fitDetails: list ONLY factors that explain the fit verdict direction. If recommendation is NO_GO or pWin is low, fitDetails should highlight what is weak or missing — not what is strong. Strengths belong in the strengths array, not in fitDetails
- If evaluation criteria are provided, tie fitDetails and gaps directly to those weighted criteria
- Before returning, verify your JSON is complete and properly closed — every array and object must have a closing bracket
- Return ONLY valid JSON with NO additional text, markdown, or explanation outside the JSON`;
};

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

const buildPromptPayload = ({ opportunity, company, updates, similarPastPursuits }) => ({
  opportunity,
  company,
  updates,
  ...(similarPastPursuits && similarPastPursuits.length > 0 ? { similarPastPursuits } : {})
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

  // Score each team member by relevance to this opportunity, then send the top 30.
  // This ensures the AI sees the right people (not a random slice) regardless of team size.
  if (companyContext && typeof companyContext === 'object') {
    // Normalise capabilities: backend stores {label, tier} objects; flatten to strings for prompt
    if (Array.isArray(companyContext.capabilities)) {
      companyContext = {
        ...companyContext,
        // Send tiers to the AI so it knows what we lead with
        capabilities: companyContext.capabilities.map((c) =>
          typeof c === 'string' ? c : `[${c.tier || 'core'}] ${c.label}`
        )
      };
    }

    if (Array.isArray(companyContext.teamMembers)) {
      const capStrings = Array.isArray(companyContext.capabilities)
        ? companyContext.capabilities.map((c) => (typeof c === 'string' ? c : c.label || ''))
        : [];
      const oppKeywords = [
        formData.agency,
        formData.description,
        formData.vehicle,
        formData.setAside,
        ...capStrings
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3);

      const scored = companyContext.teamMembers.map((member) => {
        const memberText = [
          member.role,
          ...(Array.isArray(member.skills) ? member.skills : [])
        ]
          .join(' ')
          .toLowerCase();
        const score = oppKeywords.reduce((acc, kw) => acc + (memberText.includes(kw) ? 1 : 0), 0);
        return { member, score };
      });

      scored.sort((a, b) => b.score - a.score);

      companyContext = {
        ...companyContext,
        identity: companyContext.identity || undefined,
        teamSize: companyContext.teamMembers.length,
        // Privacy: only send ID + role + skills to AI — name and email are never transmitted
        teamMembers: scored.slice(0, 30).map(({ member }) => ({
          id: member.id,
          role: member.role,
          skills: Array.isArray(member.skills) ? member.skills.slice(0, 5) : [],
          experience: member.experience
        }))
      };
    }
  }

  const opportunityJson = buildOpportunityContext(formData);
  const updatesForPrompt = includeUpdates ? opportunityUpdates : [];

  // Load past performance for the confirmed similar pursuits (max 3, compacted for prompt)
  let similarPastPursuits = [];
  try {
    const confirmedIds = Array.isArray(formData.similarPursuits) ? formData.similarPursuits.slice(0, 3) : [];
    if (confirmedIds.length > 0) {
      const allPP = await pastPerformanceService.listPastPerformance();
      similarPastPursuits = allPP
        .filter((r) => confirmedIds.includes(r.id))
        .map((r) => ({
          opportunityName: r.opportunityName,
          agency: r.agency,
          vehicle: r.vehicle,
          setAside: r.setAside,
          contractValue: r.contractValue,
          outcome: r.outcome,
          lossReason: r.lossReason || undefined,
          lessonsLearned: r.lessonsLearned.slice(0, 4),
          notes: r.notes ? r.notes.slice(0, 200) : undefined
        }));
    }
  } catch (ppError) {
    console.warn('[Opportunity Analysis] Could not load past performance:', ppError.message);
  }

  const promptPayload = buildPromptPayload({
    opportunity: opportunityJson,
    company: companyContext,
    updates: updatesForPrompt,
    similarPastPursuits
  });

  const prompt = `Evaluate this federal opportunity at ${GATE_CONTEXT[Math.min(Math.max(Number(gate), 0), 3)].stage}:

${JSON.stringify(promptPayload, null, 2)}

Provide a go/no-go recommendation with pWin score and analysis. Let the gate stage drive what you focus on.
If an rfpSummary is present, use it as the primary source of truth for scope/requirements.

Return ONLY valid JSON. Always include ALL keys below. Keep content rich but compact.

REQUIRED JSON format (always return this exact shape):
{
  "recommendation": "GO" | "SUBCONTRACT" | "NO_GO",
  "pWin": number between 0 and 100,
  "fitSummary": "string - one sentence on overall fit (used as the headline)",
  "fitDetails": ["2-5 bullets explaining the FIT VERDICT direction only — if NO_GO/low pWin, highlight what is weak or missing; if GO, highlight what is strong. Do NOT mix positives and negatives here."],
  "recommendationRationale": "2-4 sentences explaining the recommendation (not just the same as fitSummary)",
  "nextSteps": ["3-6 specific next steps tailored to this opportunity AND gate stage"],
  "pWinRationale": "1-2 sentences explaining drivers of pWin at this stage of capture",
  "gaps": [{"area":"string","detail":"string","severity":"high|medium|low","mitigation":"string"}],
  "feasibilityFactors": {"Vehicle Fit":"Strong|Moderate|Weak","Set-Aside Alignment":"Strong|Moderate|Weak","Relationship Coverage":"Strong|Moderate|Weak","Timeline Feasibility":"Favorable|Moderate|Challenging","Scope Alignment":"Strong|Moderate|Weak"},
  "strengths": ["strength1", "strength2"],
  "risks": ["risk1", "risk2"],
  "proposedTeam": ["at least 3-5 members — {memberId: from company.teamMembers only, proposedRole: their role on this proposal, rationale: 1 sentence}"]
}`;

  const systemPrompt = buildSystemPrompt(gate);
  const settings = await settingsService.getSettings();
  const finalSystemPrompt = settings.systemPromptSuffix
    ? `${systemPrompt}\n\n---\n${settings.systemPromptSuffix}`
    : systemPrompt;

  // ── DEMO: log full prompts so you can see exactly what hits the AI ──────
  console.log('\n' + '═'.repeat(72));
  console.log(`🤖  SYSTEM PROMPT (${GATE_CONTEXT[Math.min(Math.max(Number(gate), 0), 3)].stage})`);
  console.log('─'.repeat(72));
  console.log(systemPrompt);
  console.log('\n' + '─'.repeat(72));
  console.log('📋  USER PROMPT (opportunity payload)');
  console.log('─'.repeat(72));
  console.log(prompt);
  console.log('═'.repeat(72) + '\n');
  // ─────────────────────────────────────────────────────────────────────────

  try {
    const response = await callLLM({
      messages: [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: prompt }
      ],
      json: true,
      model: 'gpt-4o-mini'
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

    // Map proposed team IDs back to full members (name + email resolved here, never sent to AI)
    const teamById = loadTeamById();
    const proposedTeam = Array.isArray(response.proposedTeam)
      ? response.proposedTeam
          .map((pt) => {
            if (!pt || !pt.memberId) return null;
            const member = teamById[pt.memberId];
            if (!member) return null;
            return {
              id: member.id,
              name: member.name,
              email: member.email || '',
              role: member.role,
              proposedRole: toCompactString(pt.proposedRole),
              rationale: toCompactString(pt.rationale)
            };
          })
          .filter(Boolean)
      : [];

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
      feasibilityFactors: response.feasibilityFactors && typeof response.feasibilityFactors === 'object' ? response.feasibilityFactors : undefined,
      risks: normalizeRiskItems(response.risks || []),
      recommendation: {
        action: response.recommendation === 'GO' ? 'Go' : response.recommendation === 'SUBCONTRACT' ? 'Conditional' : 'No Go',
        rationale: recommendationRationale,
        nextSteps
      },
      proposedTeam
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

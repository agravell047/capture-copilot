const express = require('express');
const router = express.Router();
const opportunityAnalysisService = require('../services/opportunityAnalysis');
const opportunityStoreService = require('../services/opportunities');
const companyContextService = require('../services/companyContext');
const settingsService = require('../services/settings');
const teamService = require('../services/team');
const insightsService = require('../services/insights');
const proposalService = require('../services/proposal');
const multer = require('multer');
const rfpExtractService = require('../services/rfpExtract');
const rfpIngestService = require('../services/rfpIngest');
const pastPerformanceService = require('../services/pastPerformance');
const { OUTCOMES, LOSS_REASONS, LESSON_TAGS } = require('../models/pastPerformance');
const contactsService = require('../services/contacts');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 } // 12MB
});

const formatOpportunityResponse = (opportunity, extra = {}) => {
  const latestAnalysis = opportunity.latestAnalysis || {};

  return {
    ...opportunity,
    ...latestAnalysis,
    name: opportunity.name || opportunity.opportunityName,
    latestAnalysis,
    ...extra
  };
};

const analyzeAndPersistOpportunity = async (opportunityData, options = {}) => {
  const existingOpportunity = opportunityData.id
    ? await opportunityStoreService.getOpportunityById(opportunityData.id)
    : null;
  const analysisInput = existingOpportunity
    ? { ...existingOpportunity, ...opportunityData }
    : opportunityData;
  const latestAnalysis = await opportunityAnalysisService.analyzeOpportunity(analysisInput, options);

  return opportunityStoreService.upsertOpportunity({
    ...analysisInput,
    latestAnalysis
  });
};

const reanalyzeOpportunityWithFallback = async (opportunity) => {
  let latestAnalysis = opportunity.latestAnalysis || null;
  let analysisError = null;

  try {
    latestAnalysis = await opportunityAnalysisService.analyzeOpportunity(opportunity, {
      includeUpdates: true
    });
  } catch (error) {
    analysisError = error.message;
  }

  const updatedOpportunity = latestAnalysis
    ? await opportunityStoreService.attachLatestAnalysis(opportunity.id, latestAnalysis)
    : opportunity;

  return { updatedOpportunity, analysisError };
};

router.get('/company-context', async (req, res) => {
  try {
    const context = await companyContextService.getCompanyContext();
    res.json(context);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/company-context', async (req, res) => {
  try {
    const result = await companyContextService.updateCompanyContext(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const settings = await settingsService.getSettings();
    res.json({
      hasOpenAiKey: Boolean(settings.openaiApiKey),
      model: settings.model || '',
      baseUrl: settings.baseUrl || '',
      systemPromptSuffix: settings.systemPromptSuffix || ''
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const result = await settingsService.updateSettings(req.body || {});
    res.json({
      hasOpenAiKey: Boolean(result.openaiApiKey),
      model: result.model || '',
      baseUrl: result.baseUrl || '',
      systemPromptSuffix: result.systemPromptSuffix || ''
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/rfp/extract', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'file is required' });
    }

    const { text, truncated, maxChars } = await rfpExtractService.extractTextFromBuffer({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      mimetype: req.file.mimetype
    });

    res.json({
      filename: req.file.originalname,
      text,
      truncated,
      maxChars
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/rfp/ingest', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'file is required' });
    }

    const result = await rfpIngestService.ingestRfpFile(req.file);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/opportunities', async (req, res) => {
  try {
    const opportunities = await opportunityStoreService.listOpportunities();
    res.json(opportunities.map((opportunity) => formatOpportunityResponse(opportunity)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/opportunities', async (req, res) => {
  try {
    const { id, ...payload } = req.body || {};
    const shouldAnalyze = payload.description || (payload.rfp && payload.rfp.summary);

    const createdOpportunity = shouldAnalyze
      ? await analyzeAndPersistOpportunity({
        ...payload,
        status: payload.status || 'active'
      })
      : await opportunityStoreService.upsertOpportunity({
        ...payload,
        status: payload.status || 'active',
        latestAnalysis: null
      });

    res.status(201).json(formatOpportunityResponse(createdOpportunity));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Fields that can be updated without re-running AI analysis
const METADATA_ONLY_FIELDS = new Set(['gate', 'status']);

router.patch('/opportunities/:id', async (req, res) => {
  try {
    const opportunity = await opportunityStoreService.getOpportunityById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // If the patch only touches metadata fields (e.g. gate, status from drag-and-drop),
    // skip the LLM call and persist directly.
    const patchKeys = Object.keys(req.body);
    const isMetadataOnly = patchKeys.length > 0 && patchKeys.every((k) => METADATA_ONLY_FIELDS.has(k));

    if (isMetadataOnly) {
      const metaPatch = { ...req.body }
      // Coerce gate to a number so it stays consistent with the rest of the data
      if ('gate' in metaPatch) metaPatch.gate = Number(metaPatch.gate)
      const updated = await opportunityStoreService.upsertOpportunity({
        ...opportunity,
        ...metaPatch,
        id: opportunity.id,
        updatedAt: new Date().toISOString()
      });
      return res.json(formatOpportunityResponse(updated));
    }

    const updatedOpportunity = await analyzeAndPersistOpportunity({
      ...opportunity,
      ...req.body,
      id: opportunity.id
    }, { includeUpdates: true });

    res.json(formatOpportunityResponse(updatedOpportunity));
  } catch (error) {
    const statusCode = error.message === 'Opportunity not found' ? 404 : 400;
    res.status(statusCode).json({ error: error.message });
  }
});

router.get('/opportunities/:id', async (req, res) => {
  try {
    const opportunity = await opportunityStoreService.getOpportunityById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json(formatOpportunityResponse(opportunity));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/opportunities/:id/update', async (req, res) => {
  try {
    const { opportunity } = await opportunityStoreService.appendUpdate(req.params.id, req.body);
    const { updatedOpportunity, analysisError } = await reanalyzeOpportunityWithFallback(opportunity);

    res.json(formatOpportunityResponse(updatedOpportunity, {
      analysisError
    }));
  } catch (error) {
    const statusCode = error.message === 'Opportunity not found' ? 404 : 400;
    res.status(statusCode).json({ error: error.message });
  }
});

router.post('/opportunities/:id/reanalyze', async (req, res) => {
  try {
    const opportunity = await opportunityStoreService.getOpportunityById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const updatedOpportunity = await analyzeAndPersistOpportunity(opportunity, {
      includeUpdates: true
    });

    res.json(formatOpportunityResponse(updatedOpportunity));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/opportunity/:id', async (req, res) => {
  try {
    const opportunity = await opportunityStoreService.getOpportunityById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json(formatOpportunityResponse(opportunity));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze-opportunity', async (req, res) => {
  try {
    const { includeUpdates, ...incomingOpportunity } = req.body || {};
    const updatedOpportunity = await analyzeAndPersistOpportunity(incomingOpportunity, { includeUpdates });

    res.json(formatOpportunityResponse(updatedOpportunity));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/opportunity/:id/update', async (req, res) => {
  try {
    const { opportunity } = await opportunityStoreService.appendUpdate(req.params.id, req.body);
    const { updatedOpportunity, analysisError } = await reanalyzeOpportunityWithFallback(opportunity);

    res.json(formatOpportunityResponse(updatedOpportunity, {
      analysisError
    }));
  } catch (error) {
    const statusCode = error.message === 'Opportunity not found' ? 404 : 400;
    res.status(statusCode).json({ error: error.message });
  }
});

router.post('/recommend-team', async (req, res) => {
  try {
    const { rfpData } = req.body;
    const result = await teamService.recommend(rfpData);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/generate-insights', async (req, res) => {
  try {
    const { rfpData } = req.body;
    const result = await insightsService.generate(rfpData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate-proposal', async (req, res) => {
  try {
    const { rfpData } = req.body;
    const result = await proposalService.generate(rfpData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Past Performance ──────────────────────────────────────────────────────────

// GET /api/past-performance/meta — return fixed tag/reason enums for the UI
router.get('/past-performance/meta', (_req, res) => {
  res.json({ outcomes: OUTCOMES, lossReasons: LOSS_REASONS, lessonTags: LESSON_TAGS });
});

// GET /api/past-performance — list all records
router.get('/past-performance', async (_req, res) => {
  try {
    const records = await pastPerformanceService.listPastPerformance();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/past-performance/:id — single record
router.get('/past-performance/:id', async (req, res) => {
  try {
    const record = await pastPerformanceService.getPastPerformanceById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/opportunities/:id/close — mark opportunity outcome + create past performance record
router.post('/opportunities/:id/close', async (req, res) => {
  try {
    const opportunity = await opportunityStoreService.getOpportunityById(req.params.id);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });

    const { outcome, lossReason, lessonsLearned, notes } = req.body || {};
    if (!OUTCOMES.includes(outcome)) {
      return res.status(400).json({ error: `outcome must be one of: ${OUTCOMES.join(', ')}` });
    }

    // Persist outcome on the opportunity itself (changes status)
    const updatedOpportunity = await opportunityStoreService.upsertOpportunity({
      ...opportunity,
      status: outcome,
      outcome,
      outcomeDetails: { lossReason: lossReason || null, notes: notes || '' }
    });

    // Create the past performance record linked to this opportunity
    const companyContext = await companyContextService.getCompanyContext().catch(() => ({}));
    const ppRecord = await pastPerformanceService.createPastPerformance({
      opportunityId: opportunity.id,
      opportunityName: opportunity.opportunityName || opportunity.name,
      agency: opportunity.agency,
      vehicle: opportunity.vehicle,
      setAside: opportunity.setAside,
      contractValue: opportunity.contractValue,
      capabilities: companyContext.capabilities || [],
      outcome,
      lossReason: lossReason || null,
      lessonsLearned: lessonsLearned || [],
      notes: notes || '',
      closedAt: new Date().toISOString()
    });

    res.json({ opportunity: updatedOpportunity, pastPerformance: ppRecord });
  } catch (error) {
    const status = error.message.includes('already exists') ? 409 : 400;
    res.status(status).json({ error: error.message });
  }
});

// GET /api/opportunities/:id/similar-past — suggest up to 3 similar past performance records
router.get('/opportunities/:id/similar-past', async (req, res) => {
  try {
    const opportunity = await opportunityStoreService.getOpportunityById(req.params.id);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });
    const similar = await pastPerformanceService.findSimilar(opportunity, 3);
    res.json(similar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/opportunities/:id/similar-pursuits — save the user's confirmed selection
router.patch('/opportunities/:id/similar-pursuits', async (req, res) => {
  try {
    const opportunity = await opportunityStoreService.getOpportunityById(req.params.id);
    if (!opportunity) return res.status(404).json({ error: 'Opportunity not found' });

    const { similarPursuits } = req.body || {};
    if (!Array.isArray(similarPursuits)) {
      return res.status(400).json({ error: 'similarPursuits must be an array of IDs' });
    }

    const updated = await opportunityStoreService.upsertOpportunity({
      ...opportunity,
      similarPursuits: similarPursuits.slice(0, 3)
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ── Contacts ──────────────────────────────────────────────────────────────────

// GET /api/contacts
router.get('/contacts', (_req, res) => {
  try {
    res.json(contactsService.listContacts());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/contacts
router.post('/contacts', (req, res) => {
  try {
    const contact = contactsService.createContact(req.body);
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/contacts/:id
router.put('/contacts/:id', (req, res) => {
  try {
    const updated = contactsService.updateContact(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Contact not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/contacts/:id
router.delete('/contacts/:id', (req, res) => {
  try {
    const deleted = contactsService.deleteContact(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Contact not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

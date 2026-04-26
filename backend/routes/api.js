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
      baseUrl: settings.baseUrl || ''
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
      baseUrl: result.baseUrl || ''
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

router.patch('/opportunities/:id', async (req, res) => {
  try {
    const opportunity = await opportunityStoreService.getOpportunityById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
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

module.exports = router;
